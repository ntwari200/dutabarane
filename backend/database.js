// database.js
import sqlite3 from "sqlite3";
import dotenv from "dotenv";

dotenv.config();

/* =============================
   USERS DATABASE
============================= */

export const usersDB = new sqlite3.Database("./db/users.db", err => {
  if (err) console.error(err);
});

// Enable foreign keys
usersDB.run("PRAGMA foreign_keys = ON");

usersDB.serialize(() => {
  usersDB.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;

  if (adminUser && adminPass) {
    usersDB.get(
      "SELECT id FROM users WHERE username = ?",
      [adminUser],
      (err, row) => {
        if (!row) {
          usersDB.run(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            [adminUser, adminPass]
          );
          console.log("✅ Admin user created");
        }
      }
    );
  }
});

/* =============================
   SYSTEM DATABASE
============================= */

export const systemDB = new sqlite3.Database("./db/system.db", err => {
  if (err) console.error(err);
});

// IMPORTANT: enable foreign keys
systemDB.run("PRAGMA foreign_keys = ON");

systemDB.serialize(() => {
  /* ---------- MEMBERS ---------- */
  systemDB.run(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL
    )
  `);

  /* ---------- FILES ---------- */
  systemDB.run(`
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_name TEXT NOT NULL
    )
  `);

  /* ---------- FILE ROWS (LINK TABLE) ---------- */
  systemDB.run(`
    CREATE TABLE IF NOT EXISTS file_rows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_id INTEGER NOT NULL,
      member_id INTEGER NOT NULL,
      amount TEXT DEFAULT '',
      FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
    )
  `);

  /* ---------- ENSURE amount COLUMN EXISTS ---------- */
  systemDB.all("PRAGMA table_info(file_rows)", (err, columns) => {
    if (!err) {
      const hasAmount = columns.some(col => col.name === "amount");
      if (!hasAmount) {
        systemDB.run(
          "ALTER TABLE file_rows ADD COLUMN amount TEXT DEFAULT ''"
        );
        console.log("✅ Added missing 'amount' column");
      }
    }
  });
});

console.log("✅ Databases initialized successfully!");
