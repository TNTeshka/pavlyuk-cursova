import express from "express";
import cors from "cors";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { tasksRoutes } from "./modules/tasks/tasks.routes.js";
import { groupsRoutes } from "./modules/groups/groups.routes.js";
import { usersRoutes } from "./modules/users/users.routes.js";
import { errorHandler } from "./middleware/error.js";

export const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    credentials: false
  })
);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/groups", groupsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/tasks", tasksRoutes);

app.use(errorHandler);
