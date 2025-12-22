import express from "express";
import path from "path";
import dotenv from "dotenv";
import { usersDB, systemDB } from "./database.js";

dotenv.config();
const app = express();

/* =======================
   MIDDLEWARE
======================= */
app.use(express.json());
app.use(express.static(path.join(path.resolve(), "../frontend")));

/* =======================
   ROUTES
======================= */
app.get("/", (req, res) => {
  res.sendFile(path.join(path.resolve(), "../frontend/index.html"));
});

/* =======================
   LOGIN
======================= */
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  usersDB.get(
    "SELECT * FROM users WHERE username=? AND password=?",
    [username, password],
    (err, row) => {
      if (err) return res.status(500).json({ success:false });
      if (row) return res.json({ success:true });
      res.json({ success:false });
    }
  );
});

/* =======================
   MEMBERS
======================= */
app.post("/api/members", (req, res) => {
  const { name, phone } = req.body;

  systemDB.run(
    "INSERT INTO members (name, phone) VALUES (?, ?)",
    [name, phone],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ id: this.lastID });
    }
  );
});

app.get("/api/members", (req, res) => {
  systemDB.all("SELECT * FROM members", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

/* =======================
   FILES
======================= */

// GET files
app.get("/api/files", (req, res) => {
  systemDB.all("SELECT * FROM files", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

// CREATE file
app.post("/api/files", (req, res) => {
  const { name } = req.body;

  systemDB.run(
    "INSERT INTO files (name) VALUES (?)",
    [name],
    function (err) {
      if (err) return res.status(500).json(err);
      const fileId = this.lastID;

      systemDB.all("SELECT id FROM members", [], (err, members) => {
        const stmt = systemDB.prepare(
          "INSERT INTO file_rows (file_id, member_id, amount) VALUES (?, ?, '')"
        );

        members.forEach(m => stmt.run(fileId, m.id));
        stmt.finalize();

        res.json({ success:true });
      });
    }
  );
});

// OPEN file
app.get("/api/files/:id", (req, res) => {
  systemDB.all(
    "SELECT member_id, amount FROM file_rows WHERE file_id=?",
    [req.params.id],
    (err, rows) => {
      const data = {};
      rows.forEach(r => data[r.member_id] = r.amount);
      res.json(data);
    }
  );
});

// SAVE file
app.put("/api/files/:id", (req, res) => {
  const fileId = req.params.id;
  const data = req.body;

  const stmt = systemDB.prepare(
    "UPDATE file_rows SET amount=? WHERE file_id=? AND member_id=?"
  );

  Object.keys(data).forEach(memberId => {
    stmt.run(data[memberId], fileId, memberId);
  });

  stmt.finalize();
  res.json({ success:true });
});

// DELETE file
app.delete("/api/files/:id", (req, res) => {
  systemDB.run("DELETE FROM file_rows WHERE file_id=?", [req.params.id]);
  systemDB.run("DELETE FROM files WHERE id=?", [req.params.id]);
  res.json({ success:true });
});

/* =======================
   SERVER
======================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
