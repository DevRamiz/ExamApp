import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./pool.js";

const currentFile = fileURLToPath(import.meta.url);
const sqlPath = path.join(path.dirname(currentFile), "sql", "001_schema.sql");

try {
  const sql = await fs.readFile(sqlPath, "utf8");
  await pool.query(sql);
  console.log("Database migration completed.");
} catch (error) {
  console.error("Database migration failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
