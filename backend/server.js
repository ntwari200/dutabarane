import express from "express";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const app = express();

// Serve frontend files
app.use(express.static(path.join(path.resolve(), '../frontend')));
app.use(express.json());

// Your login route here
// Example:
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if(username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD){
    res.json({ success: true, message: "Login successful!" });
  } else {
    res.json({ success: false, message: "Invalid credentials" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
