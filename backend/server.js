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

// Serve frontend
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "../frontend")));

/* =======================
   ROOT
======================= */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
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
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false });
      }
      if (row) return res.json({ success: true });
      res.json({ success: false });
    }
  );
});

/* =======================
   MEMBERS
======================= */
app.post("/api/members", (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone)
    return res.status(400).json({ error: "Missing data" });

  systemDB.run(
    "INSERT INTO members (name, phone) VALUES (?, ?)",
    [name, phone],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Insert failed" });
      }
      res.json({ id: this.lastID });
    }
  );
});

app.get("/api/members", (req, res) => {
  systemDB.all("SELECT * FROM members", [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Fetch failed" });
    }
    res.json(rows);
  });
});

/* =======================
   FILES
======================= */

// LIST files
app.get("/api/files", (req, res) => {
  systemDB.all(
    "SELECT id, name FROM files",
    [],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Fetch failed" });
      }
      res.json(rows);
    }
  );
});

// CREATE file
app.post("/api/files", (req, res) => {
  const { name } = req.body;
  if (!name)
    return res.status(400).json({ error: "File name required" });

  systemDB.run(
    "INSERT INTO files (name) VALUES (?)",
    [name],
    function (err) {
      if (err) {
        console.error("FILE INSERT ERROR:", err);
        return res.status(500).json({ error: "File creation failed" });
      }

      const fileId = this.lastID;

      systemDB.all("SELECT id FROM members", [], (err, members) => {
        if (err) {
          console.error("MEMBER FETCH ERROR:", err);
          return res.status(500).json({ error: "Member fetch failed" });
        }

        const stmt = systemDB.prepare(
          "INSERT INTO file_rows (file_id, member_id, amount) VALUES (?, ?, '')"
        );

        members.forEach(m => stmt.run(fileId, m.id));
        stmt.finalize();

        res.json({ success: true });
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
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Open failed" });
      }

      const data = {};
      rows.forEach(r => (data[r.member_id] = r.amount));
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

  stmt.finalize(err => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Save failed" });
    }
    res.json({ success: true });
  });
});

// DELETE file
app.delete("/api/files/:id", (req, res) => {
  const id = req.params.id;

  systemDB.run("DELETE FROM file_rows WHERE file_id=?", [id]);
  systemDB.run("DELETE FROM files WHERE id=?", [id], err => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Delete failed" });
    }
    res.json({ success: true });
  });
});

/* =======================
   SERVER
======================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("✅ Server running on port", PORT);
});
