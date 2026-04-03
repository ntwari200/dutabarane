// server.js
import express from "express";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";
import rateLimit from "express-rate-limit";
import { pool, initDB } from "./database.js";

dotenv.config();
const app = express();

/* =======================
   ENV CHECK
======================= */
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL missing");
  process.exit(1);
}

/* =======================
   INITIALIZE DATABASE
======================= */
try {
  await initDB();
  console.log("✅ Database initialized");
} catch (err) {
  console.error("❌ DATABASE INIT FAILED:", err);
  process.exit(1);
}

/* =======================
   MIDDLEWARE
======================= */
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "../frontend")));

/* =======================
   ROOT
======================= */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

/* =======================
   LOGIN (SECURE)
======================= */
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT id, password FROM users WHERE username=$1",
      [username]
    );

    if (result.rowCount === 0) {
      return res.json({ success: false });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    res.json({ success: match });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

/* =======================
   MEMBERS
======================= */

// CREATE MEMBER
app.post("/api/members", async (req, res) => {
  const { name, phone } = req.body;

  if (!name || !phone)
    return res.status(400).json({ error: "Missing data" });

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const memberResult = await client.query(
      "INSERT INTO members (name, phone) VALUES ($1,$2) RETURNING id",
      [name, phone]
    );

    const memberId = memberResult.rows[0].id;

    const files = await client.query("SELECT id FROM files");

    // BULK INSERT (optimized)
    if (files.rows.length > 0) {
      const values = files.rows
        .map(f => `(${f.id}, ${memberId}, NULL, NULL, NULL)`)
        .join(",");

      await client.query(`
        INSERT INTO file_rows (file_id, member_id, amount, loan, interest)
        VALUES ${values}
      `);
    }

    await client.query("COMMIT");
    res.json({ id: memberId });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("ADD MEMBER ERROR:", err);
    res.status(500).json({ error: "Add member failed" });
  } finally {
    client.release();
  }
});

// LIST MEMBERS
app.get("/api/members", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, phone FROM members ORDER BY id"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("FETCH MEMBERS ERROR:", err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

// DELETE MEMBER
app.delete("/api/members/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM members WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE MEMBER ERROR:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

/* =======================
   FILES
======================= */

// LIST FILES
app.get("/api/files", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name FROM files ORDER BY id"
    );

    res.json(result.rows);
  } catch (err) {
    console.error("FETCH FILES ERROR:", err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

// CREATE FILE
app.post("/api/files", async (req, res) => {
  const { name } = req.body;

  if (!name)
    return res.status(400).json({ error: "File name required" });

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const fileResult = await client.query(
      "INSERT INTO files (name) VALUES ($1) RETURNING id",
      [name]
    );

    const fileId = fileResult.rows[0].id;

    const members = await client.query("SELECT id FROM members");

    // BULK INSERT
    if (members.rows.length > 0) {
      const values = members.rows
        .map(m => `(${fileId}, ${m.id}, NULL, NULL, NULL)`)
        .join(",");

      await client.query(`
        INSERT INTO file_rows (file_id, member_id, amount, loan, interest)
        VALUES ${values}
      `);
    }

    await client.query("COMMIT");
    res.json({ success: true });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("CREATE FILE ERROR:", err);
    res.status(500).json({ error: "Create file failed" });
  } finally {
    client.release();
  }
});

// OPEN FILE
app.get("/api/files/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT member_id, amount, loan, interest
       FROM file_rows
       WHERE file_id=$1`,
      [req.params.id]
    );

    const data = {};
    result.rows.forEach(r => {
      data[r.member_id] = {
        amount: r.amount ?? "",
        loan: r.loan ?? "",
        interest: r.interest ?? ""
      };
    });

    res.json(data);

  } catch (err) {
    console.error("OPEN FILE ERROR:", err);
    res.status(500).json({ error: "Open failed" });
  }
});

// SAVE FILE
app.put("/api/files/:id", async (req, res) => {
  const fileId = req.params.id;
  const rows = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const memberId in rows) {
      const { amount, loan, interest } = rows[memberId];

      await client.query(
        `UPDATE file_rows
         SET amount=$1,
             loan=$2,
             interest=$3
         WHERE file_id=$4
           AND member_id=$5`,
        [
          amount ?? null,
          loan ?? null,
          interest ?? null,
          fileId,
          memberId
        ]
      );
    }

    await client.query("COMMIT");
    res.json({ success: true });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("SAVE FILE ERROR:", err);
    res.status(500).json({ error: "Save failed" });
  } finally {
    client.release();
  }
});

// DELETE FILE
app.delete("/api/files/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM files WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE FILE ERROR:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

/* =======================
   DASHBOARD STATISTICS
======================= */
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const [membersResult, fileRowsResult] = await Promise.all([
      pool.query("SELECT COUNT(*) as total FROM members"),
      pool.query(`
        SELECT 
          COALESCE(SUM(amount::NUMERIC), 0) as total_amount,
          COALESCE(SUM(loan::NUMERIC), 0) as total_loan,
          COALESCE(SUM(interest::NUMERIC), 0) as total_interest
        FROM file_rows
      `)
    ]);

    const stats = {
      totalMembers: parseInt(membersResult.rows[0].total) || 0,
      totalAmount: parseFloat(fileRowsResult.rows[0].total_amount) || 0,
      totalLoan: parseFloat(fileRowsResult.rows[0].total_loan) || 0,
      totalInterest: parseFloat(fileRowsResult.rows[0].total_interest) || 0
    };

    console.log("📊 Dashboard stats sent:", stats);
    res.json(stats);

  } catch (err) {
    console.error("DASHBOARD STATS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

/* =======================
   GLOBAL ERROR HANDLER
======================= */
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({ error: "Something went wrong" });
});

/* =======================
   SERVER
======================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
