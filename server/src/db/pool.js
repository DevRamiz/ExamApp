import pg from "pg";
import { env } from "../config/env.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.nodeEnv === "production" && !env.databaseUrl.includes("@db:")
    ? { rejectUnauthorized: false }
    : false
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL error", error);
});
