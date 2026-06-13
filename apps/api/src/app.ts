import express from "express";
import cors from "cors";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { tasksRoutes } from "./modules/tasks/tasks.routes.js";
import { groupsRoutes } from "./modules/groups/groups.routes.js";
import { usersRoutes } from "./modules/users/users.routes.js";
import { errorHandler } from "./middleware/error.js";

export const app = express();

app.use(express.json());

// ==================== CORS ====================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://pavlyuk-cursova-web.vercel.app",     // ← твій фронт на Vercel
  "https://pavlyuk-cursova-api.onrender.com",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // тимчасово дозволяємо всі (для тестування)
      // callback(new Error("Not allowed by CORS")); // пізніше можна увімкнути
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));

// Обов'язково для OPTIONS preflight запитів
app.options("*", cors());
// =============================================

app.get("/health", (_req, res) => res.json({ ok: true, message: "Server is running" }));

app.use("/api/auth", authRoutes);
app.use("/api/groups", groupsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/tasks", tasksRoutes);

app.use(errorHandler);

export default app;