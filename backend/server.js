import express from "express";
import path from "path";
import dotenv from "dotenv";
import { pool, initDB } from "./database.js";
import { v4 as uuidv4 } from "uuid";

dotenv.config();
const app = express();

/* ======================= INITIALIZE DATABASE ======================== */
await initDB();

/* ======================= MIDDLEWARE ======================== */
app.use(express.json());
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "../frontend")));

/* ======================= ROOT ======================== */
app.get("/", (req,res)=>res.sendFile(path.join(__dirname,"../frontend/index.html")));

/* ======================= LOGIN ======================== */
app.post("/login", async (req,res)=>{
  const {username,password}=req.body;
  try{
    const result = await pool.query(
      "SELECT id FROM users WHERE username=$1 AND password=$2",
      [username,password]
    );
    res.json({success: result.rowCount>0});
  } catch(err){
    console.error(err);
    res.status(500).json({success:false});
  }
});

/* ======================= MEMBERS ======================== */
// LIST MEMBERS
app.get("/api/members", async (req,res)=>{
  try{
    const result = await pool.query("SELECT * FROM members ORDER BY name");
    res.json(result.rows);
  }catch(err){
    console.error(err);
    res.status(500).json({error:"Fetch members failed"});
  }
});

// CREATE MEMBER
app.post("/api/members", async (req,res)=>{
  const {name,phone} = req.body;
  if(!name || !phone) return res.status(400).json({error:"Missing data"});
  const client = await pool.connect();
  try{
    const memberId = uuidv4();
    await client.query(
      "INSERT INTO members (id,name,phone) VALUES ($1,$2,$3)",
      [memberId,name,phone]
    );

    const files = await client.query("SELECT id FROM files");
    for(const file of files.rows){
      await client.query(
        "INSERT INTO file_rows (id,file_id,member_id,amount,loan) VALUES ($1,$2,$3,'','')",
        [uuidv4(), file.id, memberId]
      );
    }

    res.json({id:memberId});
  }catch(err){
    console.error(err);
    res.status(500).json({error:"Add member failed"});
  }finally{ client.release(); }
});

// DELETE MEMBER
app.delete("/api/members/:id", async (req,res)=>{
  try{
    await pool.query("DELETE FROM members WHERE id=$1",[req.params.id]);
    res.json({success:true});
  }catch(err){
    console.error(err);
    res.status(500).json({error:"Delete member failed"});
  }
});

/* ======================= FILES ======================== */
// LIST FILES
app.get("/api/files", async (req,res)=>{
  try{
    const result = await pool.query("SELECT * FROM files ORDER BY file_name");
    res.json(result.rows);
  }catch(err){
    console.error(err);
    res.status(500).json({error:"Fetch files failed"});
  }
});

// CREATE FILE
app.post("/api/files", async (req,res)=>{
  const {name} = req.body;
  if(!name) return res.status(400).json({error:"File name required"});
  const client = await pool.connect();
  try{
    const fileId = uuidv4();
    await client.query("INSERT INTO files (id,file_name) VALUES ($1,$2)",[fileId,name]);

    const members = await client.query("SELECT id FROM members");
    for(const m of members.rows){
      await client.query(
        "INSERT INTO file_rows (id,file_id,member_id,amount,loan) VALUES ($1,$2,$3,'','')",
        [uuidv4(), fileId, m.id]
      );
    }

    res.json({success:true});
  }catch(err){
    console.error(err);
    res.status(500).json({error:"Create file failed"});
  }finally{ client.release(); }
});

// OPEN FILE
app.get("/api/files/:id", async (req,res)=>{
  try{
    const result = await pool.query(
      "SELECT member_id, amount, loan FROM file_rows WHERE file_id=$1",
      [req.params.id]
    );
    const data = {};
    result.rows.forEach(r=>data[r.member_id]={amount:r.amount,loan:r.loan});
    res.json(data);
  }catch(err){
    console.error(err);
    res.status(500).json({error:"Open file failed"});
  }
});

// SAVE FILE
app.put("/api/files/:id", async (req,res)=>{
  const fileId=req.params.id;
  const data=req.body;
  const client = await pool.connect();
  try{
    for(const memberId in data){
      const {amount,loan}=data[memberId];
      await client.query(
        "UPDATE file_rows SET amount=$1,loan=$2 WHERE file_id=$3 AND member_id=$4",
        [amount||'',loan||'',fileId,memberId]
      );
    }
    res.json({success:true});
  }catch(err){
    console.error(err);
    res.status(500).json({error:"Save file failed"});
  }finally{ client.release(); }
});

// DELETE FILE
app.delete("/api/files/:id", async (req,res)=>{
  try{
    await pool.query("DELETE FROM files WHERE id=$1",[req.params.id]);
    res.json({success:true});
  }catch(err){
    console.error(err);
    res.status(500).json({error:"Delete file failed"});
  }
});

/* ======================= SERVER ======================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>console.log("✅ Server running on port",PORT));
