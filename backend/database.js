// database.js
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

export async function initDB() {
  const client = await pool.connect();
  try {
    // Users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `);

    // Members
    await client.query(`
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL
      )
    `);

    // Files
    await client.query(`
      CREATE TABLE IF NOT EXISTS files (
        id SERIAL PRIMARY KEY,
        file_name TEXT NOT NULL
      )
    `);

    // File Rows
    await client.query(`
      CREATE TABLE IF NOT EXISTS file_rows (
        id SERIAL PRIMARY KEY,
        file_id INTEGER NOT NULL,
        member_id INTEGER NOT NULL,
        amount TEXT DEFAULT '',
        loan TEXT DEFAULT '',
        CONSTRAINT fk_file FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
        CONSTRAINT fk_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
        CONSTRAINT unique_file_member UNIQUE (file_id, member_id)
      )
    `);

    // Create admin
    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;
    if (adminUser && adminPass) {
      const exists = await client.query(
        "SELECT id FROM users WHERE username = $1",
        [adminUser]
      );
      if (exists.rowCount === 0) {
        await client.query(
          "INSERT INTO users (username, password) VALUES ($1,$2)",
          [adminUser, adminPass]
        );
        console.log("✅ Admin user created");
      }
    }

    console.log("✅ PostgreSQL database initialized successfully");
  } catch (err) {
    console.error("❌ DB init error:", err);
  } finally {
    client.release();
  }
}
