// db.js
import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// --- LOG SQL ---
const _query = pool.query.bind(pool);
pool.query = async (...args) => {
  const [text, params] = args;
  console.log("SQL =>", text, "PARAMS =>", params);
  try {
    return await _query(...args);
  } catch (e) {
    console.error("SQL ERROR =>", e.message);
    throw e;
  }
};
