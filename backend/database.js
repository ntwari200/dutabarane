// database.js (PostgreSQL - production ready)

import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

/* =============================
   POSTGRES CONNECTION
============================= */

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false
});

/* =============================
   INIT DATABASE
============================= */

export async function initDB() {
  const client = await pool.connect();

  try {
    /* ---------- UUID EXTENSION ---------- */
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    /* ---------- USERS ---------- */
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `);

    /* ---------- MEMBERS ---------- */
    await client.query(`
      CREATE TABLE IF NOT EXISTS members (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    /* ---------- FILES ---------- */
    await client.query(`
      CREATE TABLE IF NOT EXISTS files (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    /* ---------- FILE ROWS ---------- */
    await client.query(`
      CREATE TABLE IF NOT EXISTS file_rows (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        file_id UUID NOT NULL,
        member_id UUID NOT NULL,
        amount NUMERIC DEFAULT 0,
        loan NUMERIC DEFAULT 0,

        CONSTRAINT fk_file
          FOREIGN KEY (file_id)
          REFERENCES files(id)
          ON DELETE CASCADE,

        CONSTRAINT fk_member
          FOREIGN KEY (member_id)
          REFERENCES members(id)
          ON DELETE CASCADE,

        CONSTRAINT unique_file_member
          UNIQUE (file_id, member_id)
      )
    `);

    /* ---------- CREATE ADMIN ---------- */
    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;

    if (adminUser && adminPass) {
      const exists = await client.query(
        "SELECT id FROM users WHERE username = $1",
        [adminUser]
      );

      if (exists.rowCount === 0) {
        await client.query(
          "INSERT INTO users (username, password) VALUES ($1, $2)",
          [adminUser, adminPass]
        );
        console.log("✅ Admin user created");
      }
    }

    console.log("✅ PostgreSQL database fully initialized");

  } catch (err) {
    console.error("❌ Database init error:", err);
  } finally {
    client.release();
  }
}
