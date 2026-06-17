import bcrypt from "bcrypt";
import { pool } from "../db/db.js";

export const getUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, email, name, created_at FROM users");
    res.json({
      message: "Get users success",
      data: { users: result.rows },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "DB error" });
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
      RETURNING id, email, name, created_at
      `,
      [email, hashedPassword, name, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Update user success",
      data: { user: result.rows[0] },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update error" });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Delete user success" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete error" });
  }
};
