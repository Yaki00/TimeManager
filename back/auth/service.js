import bcrypt from "bcrypt";
import { pool } from "../db.js";

export async function findUserByEmail(email) {
  const { rows } = await pool.query(
    "SELECT id, email, password_hash FROM users WHERE email=$1",
    [email]
  );
  return rows[0] || null;
}

export async function createUser({ email, password }) {
  const hash = await bcrypt.hash(password, 12);
  const { rows } = await pool.query(
    "INSERT INTO users (email, password_hash) VALUES ($1,$2) RETURNING id, email",
    [email, hash]
  );
  return rows[0];
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}
