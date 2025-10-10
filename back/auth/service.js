import bcrypt from "bcrypt";
import { pool } from "../db.js";

export async function findUserByEmail(email) {
  const { rows } = await pool.query(
    'SELECT "id_user", "email", "password" FROM "User" WHERE "email" = $1',
    [email]
  );
  if (!rows[0]) return null;
  const r = rows[0];
  return { id: r.id_user, email: r.email, password: r.password };
}

export async function createUser({ email, password }) {
  const hash = await bcrypt.hash(password, 12);
  const { rows } = await pool.query(
    `INSERT INTO "User"
     ("email","password","first_name","last_name","phone_number","role","contrat_type","updated_at")
     VALUES ($1,$2,'','','','Employer','H35', NOW())
     RETURNING "id_user","email"`,
    [email, hash]
  );
  const r = rows[0];
  return { id: r.id_user, email: r.email };
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}
