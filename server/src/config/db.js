import pg from "pg";

const { Pool } = pg;
// PostgreSQL DATE values are calendar dates, not timestamps. Keep them as
// ISO strings so server timezone offsets cannot shift a day in API responses.
pg.types.setTypeParser(1082, (value) => value);
const connection = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || "sweety",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD,
    };

export const pool = new Pool({
  ...connection,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error);
});

export async function query(text, params) {
  return pool.query(text, params);
}

export async function initializeDatabase() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS readings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reading_date DATE NOT NULL,
      slot VARCHAR(30) NOT NULL CHECK (slot IN ('morning','after_breakfast','after_lunch','after_dinner')),
      value INTEGER NOT NULL CHECK (value BETWEEN 40 AND 600),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT one_reading_per_slot_per_day UNIQUE (user_id, reading_date, slot)
    );
    CREATE INDEX IF NOT EXISTS idx_readings_user_date ON readings(user_id, reading_date);
  `);
}
