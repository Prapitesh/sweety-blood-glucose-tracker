import { query, pool } from '../config/db.js';
import { AppError } from '../utils/errors.js';
import { SLOTS, validateReading, isValidDate } from '../utils/validation.js';

function mapDate(rawDate) {
  return rawDate instanceof Date
    ? [rawDate.getFullYear(), String(rawDate.getMonth() + 1).padStart(2, '0'), String(rawDate.getDate()).padStart(2, '0')].join('-')
    : String(rawDate).slice(0, 10);
}

function mapReading(row) {
  return { id: row.id, date: mapDate(row.reading_date), slot: row.slot, slotLabel: SLOTS[row.slot], value: row.value };
}

export async function listReadings(userId, { page = 1, limit = 20 } = {}) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (p - 1) * l;
  const [{ rows }, count] = await Promise.all([
    query('SELECT id,reading_date,slot,value FROM readings WHERE user_id=$1 ORDER BY reading_date DESC,slot ASC LIMIT $2 OFFSET $3', [userId, l, offset]),
    query('SELECT COUNT(*)::int AS total FROM readings WHERE user_id=$1', [userId])
  ]);
  return { items: rows.map(mapReading), page: p, limit: l, total: count.rows[0].total };
}

async function lockUserDay(client, userId, date) {
  await client.query('SELECT pg_advisory_xact_lock(hashtext($1),hashtext($2))', [userId, date]);
}

export async function createReading(userId, input) {
  const value = validateReading(input);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await lockUserDay(client, userId, input.date);
    const day = await client.query('SELECT COUNT(*)::int AS count FROM readings WHERE user_id=$1 AND reading_date=$2', [userId, input.date]);
    const duplicate = await client.query('SELECT 1 FROM readings WHERE user_id=$1 AND reading_date=$2 AND slot=$3', [userId, input.date, input.slot]);
    if (duplicate.rowCount) throw new AppError('You already have a ' + SLOTS[input.slot] + ' reading for this date.', 409);
    if (day.rows[0].count >= 4) throw new AppError('You can add only 4 readings per day.', 409);
    const result = await client.query('INSERT INTO readings(user_id,reading_date,slot,value) VALUES($1,$2,$3,$4) RETURNING id,reading_date,slot,value', [userId, input.date, input.slot, value]);
    await client.query('COMMIT');
    return mapReading(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') throw new AppError('You already have a ' + SLOTS[input.slot] + ' reading for this date.', 409);
    throw error;
  } finally {
    client.release();
  }
}

export async function updateReading(userId, id, input) {
  const value = validateReading(input);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await lockUserDay(client, userId, input.date);
    const duplicate = await client.query('SELECT 1 FROM readings WHERE user_id=$1 AND reading_date=$2 AND slot=$3 AND id<>$4', [userId, input.date, input.slot, id]);
    if (duplicate.rowCount) throw new AppError('You already have a ' + SLOTS[input.slot] + ' reading for this date.', 409);
    const day = await client.query('SELECT COUNT(*)::int AS count FROM readings WHERE user_id=$1 AND reading_date=$2 AND id<>$3', [userId, input.date, id]);
    if (day.rows[0].count >= 4) throw new AppError('You can add only 4 readings per day.', 409);
    const result = await client.query('UPDATE readings SET reading_date=$1,slot=$2,value=$3,updated_at=NOW() WHERE id=$4 AND user_id=$5 RETURNING id,reading_date,slot,value', [input.date, input.slot, value, id, userId]);
    if (!result.rows[0]) throw new AppError('Reading not found.', 404);
    await client.query('COMMIT');
    return mapReading(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') throw new AppError('You already have a ' + SLOTS[input.slot] + ' reading for this date.', 409);
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteReading(userId, id) {
  const { rowCount } = await query('DELETE FROM readings WHERE id=$1 AND user_id=$2', [id, userId]);
  if (!rowCount) throw new AppError('Reading not found.', 404);
}

export async function getReports(userId, selectedDate) {
  const date = selectedDate || new Date().toLocaleDateString('en-CA');
  if (!isValidDate(date)) throw new AppError('Please select a valid report date.');
  const [year, month] = date.split('-').map(Number);
  const monthStart = year + '-' + String(month).padStart(2, '0') + '-01';
  const previousMonthEnd = new Date(Date.UTC(year, month - 1, 0)).toISOString().slice(0, 10);
  const previousMonthStart = new Date(Date.UTC(year, month - 2, 1)).toISOString().slice(0, 10);
  const currentMonthEnd = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
  const ranges = {
    daily: { start: date, end: date },
    monthToDate: { start: monthStart, end: date },
    previousMonth: { start: previousMonthStart, end: previousMonthEnd }
  };
  const reports = {};
  for (const [key, range] of Object.entries(ranges)) {
    const { rows } = await query(
      'SELECT COUNT(*)::int AS count,MIN(value)::int AS lowest,MAX(value)::int AS highest,ROUND(AVG(value)::numeric,1)::float AS average FROM readings WHERE user_id=$1 AND reading_date BETWEEN $2 AND $3',
      [userId, range.start, range.end]
    );
    reports[key] = { ...range, ...rows[0] };
  }
  const daily = await query(
    "SELECT id,reading_date,slot,value FROM readings WHERE user_id=$1 AND reading_date=$2 ORDER BY CASE slot WHEN 'morning' THEN 1 WHEN 'after_breakfast' THEN 2 WHEN 'after_lunch' THEN 3 ELSE 4 END",
    [userId, date]
  );
  const trend = await query(
    'SELECT reading_date,ROUND(AVG(value)::numeric,1)::float AS average FROM readings WHERE user_id=$1 AND reading_date BETWEEN $2 AND $3 GROUP BY reading_date ORDER BY reading_date',
    [userId, monthStart, currentMonthEnd]
  );
  return {
    selectedDate: date,
    reports,
    dailyReadings: daily.rows.map(mapReading),
    monthlyTrend: trend.rows.map(row => ({ date: mapDate(row.reading_date), average: row.average }))
  };
}
