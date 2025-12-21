import express from "express";
import path from "path";
import dotenv from "dotenv";
import { usersDB, systemDB } from "./database.js";

dotenv.config();
const app = express();

// -----------------------------
// Middleware
// -----------------------------
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(path.resolve(), "../frontend")));

// Default route to serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(path.resolve(), "../frontend/index.html"));
});

// -----------------------------
// LOGIN ROUTE
// -----------------------------
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check users.db
  usersDB.get(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, row) => {
      if (err) {
        return res.status(500).json({ success: false, message: "DB error" });
      }
      if (row) {
        res.json({ success: true, message: "Login successful!" });
      } else {
        res.json({ success: false, message: "Invalid credentials" });
      }
    }
  );
});

// -----------------------------
// SYSTEM MANAGEMENT APIS
// -----------------------------

// 1️⃣ Add member
app.post("/api/members", async (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone)
    return res.status(400).json({ error: "Name and phone required" });

  try {
    systemDB.run(
      "INSERT INTO members (name, phone) VALUES (?, ?)",
      [name, phone],
      function (err) {
        if (err) return res.status(500).json({ error: "DB error" });
        res.json({ message: "Member added", member_id: this.lastID });
      }
    );
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// 2️⃣ Get members
app.get("/api/members", async (req, res) => {
  try {
    systemDB.all("SELECT * FROM members", [], (err, rows) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json(rows);
    });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// 3️⃣ Create new file (auto-copy members)
app.post("/api/files", async (req, res) => {
  const { file_name } = req.body;
  if (!file_name) return res.status(400).json({ error: "File name required" });

  try {
    // 1. Create file
    systemDB.run(
      "INSERT INTO files (file_name) VALUES (?)",
      [file_name],
      function (err) {
        if (err) return res.status(500).json({ error: "DB error" });
        const fileId = this.lastID;

        // 2. Get all members
        systemDB.all("SELECT id FROM members", [], (err, members) => {
          if (err) return res.status(500).json({ error: "DB error" });

          // 3. Insert into file_rows
          const stmt = systemDB.prepare(
            "INSERT INTO file_rows (file_id, member_id, data) VALUES (?, ?, '')"
          );
          members.forEach((m) => {
            stmt.run(fileId, m.id);
          });
          stmt.finalize();

          res.json({ message: "File created with default members", file_id: fileId });
        });
      }
    );
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// -----------------------------
// START SERVER
// -----------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
