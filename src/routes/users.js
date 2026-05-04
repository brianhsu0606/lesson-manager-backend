import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getUsers, createUser, updateUser, deleteUser } from "../controllers/usersController.js";

const router = express.Router();

router.get("/", authMiddleware, getUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
