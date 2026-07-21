import { Pool } from 'pg';

// Single shared connection pool. DATABASE_URL must be set in every environment
// that stores or reads contact submissions (Replit provides it in development;
// the same value is added to Vercel's environment variables for production).
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL is not configured');
    }
    pool = new Pool({
      connectionString: url,
      max: 3,
      // Neon-backed databases require TLS with full certificate verification.
      ssl: url.includes('localhost') ? undefined : { rejectUnauthorized: true },
    });
  }
  return pool;
}
