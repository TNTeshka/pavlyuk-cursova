import { Router } from "express";
import { z } from "zod";
import { auth } from "../../middleware/auth.js";
import { createTask, deleteTask, getTask, getTaskStats, getDashboardStats, listTasks, updateTask } from "./tasks.controller.js";
import { validate } from "../../middleware/validate.js";
import { TaskPriority, TaskStatus } from "@prisma/client";

export const tasksRoutes = Router();

const listTasksQuery = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional()
});

const dueDateSchema = z.preprocess(
  (v) => (v === "" ? undefined : v),
  z.union([z.coerce.date(), z.null()]).optional()
);

export const createTaskBody = z.object({
  title: z.string().min(1),
  description: z.string().min(1).optional().nullable(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: dueDateSchema.optional(),
  deadline: dueDateSchema.optional(),
});

const taskIdParams = z.object({ id: z.string().min(1) });

const updateTaskBody = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional().nullable(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: dueDateSchema
});

tasksRoutes.get("/", auth, validate({ query: listTasksQuery }), listTasks);
// Dashboard stats endpoint (total done, pending, overdue) – protected
tasksRoutes.get("/dashboard", auth, getDashboardStats);
tasksRoutes.get("/stats", auth, getTaskStats);
tasksRoutes.post("/", auth, validate({ body: createTaskBody }), createTask);
tasksRoutes.get("/:id", auth, validate({ params: taskIdParams }), getTask);
tasksRoutes.patch("/:id", auth, validate({ params: taskIdParams, body: updateTaskBody }), updateTask);
tasksRoutes.delete("/:id", auth, validate({ params: taskIdParams }), deleteTask);
