import sqlite3 from "sqlite3";
import dotenv from "dotenv";

dotenv.config();

const db = new sqlite3.Database("./db/users.db");

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )
    `);

    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;

    db.get(`SELECT * FROM users WHERE username = ?`, [adminUser], (err, row) => {
        if (!row) {
            db.run(`INSERT INTO users (username, password) VALUES (?, ?)`,
                [adminUser, adminPass]);
            console.log("Admin created: ", adminUser);
        }
    });
});

export default db;
