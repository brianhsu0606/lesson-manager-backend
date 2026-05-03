import express from "express";
import pkg from "pg";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

// GET Users
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("DB error");
  }
});

// POST user
app.post("/users", async (req, res) => {
  const { email, password, name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query("INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING *", [
      email,
      hashedPassword,
      name,
    ]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Insert error");
  }
});

app.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { email, password, name } = req.body;

  try {
    const result = await pool.query("UPDATE users SET email = $1, password = $2, name = $3 WHERE id = $4 RETURNING *", [
      email,
      password,
      name,
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).send("User not found");
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Update error");
  }
});

app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).send("User not found");
    }

    res.send("Deleted");
  } catch (err) {
    console.error(err);
    res.status(500).send("Delete error");
  }
});

// login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1️⃣ 找 user
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(401).send("User not found");
    }

    const user = result.rows[0];

    // 2️⃣ 比對密碼
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).send("Invalid password");
    }

    // 3️⃣ 產生 token
    const token = jwt.sign(
      { userId: user.id },
      "secret_key", // 之後會放 env
      { expiresIn: "1h" },
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).send("Login error");
  }
});

app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
