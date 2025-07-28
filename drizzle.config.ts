import { defineConfig } from "drizzle-kit";

// Build connection string from individual parts if DATABASE_URL is not provided
let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  const { PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
  
  if (!PGHOST || !PGDATABASE || !PGUSER || !PGPASSWORD) {
    throw new Error("DATABASE_URL or individual PG* environment variables (PGHOST, PGDATABASE, PGUSER, PGPASSWORD) must be provided");
  }
  
  const port = PGPORT || '5432';
  databaseUrl = `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${port}/${PGDATABASE}?sslmode=require`;
  
  console.log(`Built DATABASE_URL from individual credentials: postgresql://${PGUSER}:***@${PGHOST}:${port}/${PGDATABASE}`);
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
