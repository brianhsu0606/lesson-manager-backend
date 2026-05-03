import express from "express";
import authRoutes from "./src/routes/auth.js";
import userRoutes from "./src/routes/users.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello Backend");
});

app.use("/", authRoutes);
app.use("/users", userRoutes);

app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
