import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false, // connexion interne via le docker => pas besoin de SSL
  // process.env.NODE_ENV === 'production'
  //   ? { rejectUnauthorized: false } // Required for Supabase
  //   : false, // Disabled for local Docker
});

export const db: NodePgDatabase<typeof schema> = drizzle(pool, { schema });
