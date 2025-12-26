// server.js
import express from "express";
import path from "path";
import dotenv from "dotenv";
import { pool, initDB } from "./database.js";

dotenv.config();
const app = express();

/* ===================== INIT DB ===================== */
await initDB();

/* ===================== MIDDLEWARE ===================== */
app.use(express.json());

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "../frontend")));

/* ===================== ROOT ===================== */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

/* ===================== LOGIN ===================== */
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      "SELECT id FROM users WHERE username=$1 AND password=$2",
      [username, password]
    );
    res.json({ success: result.rowCount > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

/* ===================== MEMBERS ===================== */
app.post("/api/members", async (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) return res.status(400).json({ error: "Missing data" });

  const client = await pool.connect();
  try {
    const memberResult = await client.query(
      "INSERT INTO members (name, phone) VALUES ($1,$2) RETURNING id",
      [name, phone]
    );
    const memberId = memberResult.rows[0].id;

    const files = await client.query("SELECT id FROM files");
    for (const file of files.rows) {
      await client.query(
        `INSERT INTO file_rows (file_id, member_id, amount, loan)
         VALUES ($1, $2, '', '')`,
        [file.id, memberId]
      );
    }
    res.json({ id: memberId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Add member failed" });
  } finally {
    client.release();
  }
});

app.get("/api/members", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM members ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

app.delete("/api/members/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM members WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

/* ===================== FILES ===================== */
app.get("/api/files", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, file_name AS name FROM files ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

app.post("/api/files", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "File name required" });

  const client = await pool.connect();
  try {
    const fileResult = await client.query(
      "INSERT INTO files (file_name) VALUES ($1) RETURNING id",
      [name]
    );
    const fileId = fileResult.rows[0].id;

    const members = await client.query("SELECT id FROM members");
    for (const m of members.rows) {
      await client.query(
        `INSERT INTO file_rows (file_id, member_id, amount, loan)
         VALUES ($1, $2, '', '')`,
        [fileId, m.id]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Create file failed" });
  } finally {
    client.release();
  }
});

app.get("/api/files/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT member_id, amount, loan FROM file_rows WHERE file_id=$1",
      [req.params.id]
    );

    const data = {};
    result.rows.forEach(r => {
      data[r.member_id + "_amount"] = r.amount;
      data[r.member_id + "_loan"] = r.loan;
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Open failed" });
  }
});

app.put("/api/files/:id", async (req, res) => {
  const fileId = req.params.id;
  const data = req.body;
  const client = await pool.connect();
  try {
    for (const key in data) {
      const [memberId, col] = key.split("_");
      await client.query(
        `UPDATE file_rows SET ${col}=$1 WHERE file_id=$2 AND member_id=$3`,
        [data[key], fileId, memberId]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Save failed" });
  } finally {
    client.release();
  }
});

app.delete("/api/files/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM files WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

/* ===================== SERVER ===================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("✅ Server running on port", PORT));
