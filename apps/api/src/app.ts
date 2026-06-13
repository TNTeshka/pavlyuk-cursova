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
    origin: [
      "http://localhost:5173",           // ← твій фронт зараз
      "http://localhost:3000",
      "https://pavlyuk-cursova-api.onrender.com",
      // Коли задеплоїш фронт — додаси його адресу сюди, наприклад:
      // "https://твій-фронт.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  })
);

app.options("*", cors());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/groups", groupsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/tasks", tasksRoutes);

app.use(errorHandler);
