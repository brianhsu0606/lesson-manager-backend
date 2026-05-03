import express from "express";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;
const app = express();
app.use(express.json());

// DB 連線
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.get("/", (req, res) => {
  res.send("Hello Backend");
});

app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("DB error");
  }
});

// 新增 user
app.post("/users", async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const result = await pool.query("INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING *", [
      email,
      password,
      name,
    ]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Insert error");
  }
});

app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
