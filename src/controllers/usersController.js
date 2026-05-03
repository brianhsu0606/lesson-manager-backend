import bcrypt from "bcrypt";
import { pool } from "../db/db.js";

export const getUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("DB error");
  }
};

export const createUser = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

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
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, password, name } = req.body;

  try {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const result = await pool.query(
      `
      UPDATE users
      SET
        email = $1,
        password = COALESCE($2, password),
        name = $3
      WHERE id = $4
      RETURNING *
      `,
      [email, hashedPassword, name, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).send("User not found");
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Update error");
  }
};

export const deleteUser = async (req, res) => {
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
};
