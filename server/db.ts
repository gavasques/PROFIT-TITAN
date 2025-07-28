import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Build connection string from individual parts if DATABASE_URL is not provided
let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  const { PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
  
  if (!PGHOST || !PGDATABASE || !PGUSER || !PGPASSWORD) {
    throw new Error("DATABASE_URL or individual PG* environment variables (PGHOST, PGDATABASE, PGUSER, PGPASSWORD) must be set");
  }
  
  const port = PGPORT || '5432';
  databaseUrl = `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${port}/${PGDATABASE}?sslmode=require`;
  
  console.log(`🔗 Built connection string from individual credentials: postgresql://${PGUSER}:***@${PGHOST}:${port}/${PGDATABASE}`);
}

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });