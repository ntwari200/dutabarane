import sqlite3 from "sqlite3";
import dotenv from "dotenv";

dotenv.config();

/* =========================
   USERS DATABASE (LOGIN)
   ========================= */
const usersDB = new sqlite3.Database("./db/users.db");

usersDB.serialize(() => {
    usersDB.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )
    `);

    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;

    usersDB.get(
        `SELECT * FROM users WHERE username = ?`,
        [adminUser],
        (err, row) => {
            if (!row) {
                usersDB.run(
                    `INSERT INTO users (username, password) VALUES (?, ?)`,
                    [adminUser, adminPass]
                );
                console.log("Admin created:", adminUser);
            }
        }
    );
});

/* =========================
   SYSTEM DATABASE
   ========================= */
const systemDB = new sqlite3.Database("./db/system.db");

systemDB.serialize(() => {
    // MEMBERS TABLE
    systemDB.run(`
        CREATE TABLE IF NOT EXISTS members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // FILES TABLE
    systemDB.run(`
        CREATE TABLE IF NOT EXISTS files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // FILE ROWS TABLE (FOREIGN KEYS)
    systemDB.run(`
        CREATE TABLE IF NOT EXISTS file_rows (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_id INTEGER NOT NULL,
            member_id INTEGER NOT NULL,
            data TEXT,
            FOREIGN KEY (file_id) REFERENCES files(id),
            FOREIGN KEY (member_id) REFERENCES members(id)
        )
    `);

    console.log("System database initialized (members, files, file_rows)");
});

/* =========================
   EXPORT BOTH DATABASES
   ========================= */
export { usersDB, systemDB };

