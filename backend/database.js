// database.js
import sqlite3 from "sqlite3";
import dotenv from "dotenv";

dotenv.config();

// ---------------------
// USERS DB
// ---------------------
export const usersDB = new sqlite3.Database("./db/users.db");

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

    usersDB.get(`SELECT * FROM users WHERE username = ?`, [adminUser], (err, row) => {
        if (!row) {
            usersDB.run(`INSERT INTO users (username, password) VALUES (?, ?)`,
                [adminUser, adminPass]);
            console.log("Admin created: ", adminUser);
        }
    });
});

// ---------------------
// SYSTEM DB
// ---------------------
export const systemDB = new sqlite3.Database("./db/system.db");

systemDB.serialize(() => {
    // Members table
    systemDB.run(`
        CREATE TABLE IF NOT EXISTS members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL
        )
    `);

    // Files table
    systemDB.run(`
        CREATE TABLE IF NOT EXISTS files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        )
    `);

    // File rows table
    systemDB.run(`
        CREATE TABLE IF NOT EXISTS file_rows (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_id INTEGER NOT NULL,
            member_id INTEGER NOT NULL,
            amount TEXT DEFAULT '',
            FOREIGN KEY(file_id) REFERENCES files(id),
            FOREIGN KEY(member_id) REFERENCES members(id)
        )
    `);

    // Ensure `amount` column exists (in case DB was old)
    systemDB.all("PRAGMA table_info(file_rows)", (err, columns) => {
        if (!err) {
            const hasAmount = columns.some(col => col.name === "amount");
            if (!hasAmount) {
                systemDB.run("ALTER TABLE file_rows ADD COLUMN amount TEXT DEFAULT ''");
                console.log("✅ Added missing 'amount' column to file_rows");
            }
        }
    });
});

console.log("✅ Databases initialized successfully!");


