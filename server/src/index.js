import dotenv from 'dotenv';
dotenv.config({ path: new URL('../../.env', import.meta.url) });
import app from './app.js';
import { initializeDatabase, pool } from './config/db.js';

const port = Number(process.env.PORT) || 5000;
try {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters.');
  }
  await initializeDatabase();
  const server = app.listen(port, () => console.log(`Sweety API running on http://localhost:${port}`));
  const shutdown = () => server.close(async () => { await pool.end(); process.exit(0); });
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
} catch (error) {
  console.error('Could not start Sweety API:', error.message);
  await pool.end();
  process.exit(1);
}
