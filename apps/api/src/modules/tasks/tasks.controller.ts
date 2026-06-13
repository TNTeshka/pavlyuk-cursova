import type { Response, NextFunction } from "express";
import { io } from "../../socket";
import type { AuthedRequest } from "../../middleware/auth.js";
import { TaskPriority, TaskStatus } from "@prisma/client";
import * as tasksService from "../../services/tasks.service.js";
import { ApiError } from "../../middleware/error.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";

export const createTask = asyncHandler(async (req: AuthedRequest, res: Response, next: NextFunction) => {
  const input = req.body as {
    title: string;
    description?: string | null;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: Date | null;
    deadline?: Date | null;
  };

  // Prefer explicit deadline if provided
  const due = input.dueDate ?? input.deadline;
  const task = await tasksService.createTask({ userId: req.user!.id, title: input.title, description: input.description, status: input.status, priority: input.priority, dueDate: due });
  // Emit real‑time event to all connected clients
  io?.emit("task:created", { task });

  return res.status(201).json({ task });
});

export const listTasks = asyncHandler(async (req: AuthedRequest, res: Response, next: NextFunction) => {
  const status = (req.query as any).status as TaskStatus | undefined;
  const priority = (req.query as any).priority as TaskPriority | undefined;

  const tasks = await tasksService.listTasks({ userId: req.user!.id, status, priority });

  return res.json({ tasks });
});

export const getTask = asyncHandler(async (req: AuthedRequest, res: Response, next: NextFunction) => {
  const id = req.params.id as string;

  const task = await tasksService.getTask({ id, userId: req.user!.id });

  if (!task) throw new ApiError(404, "NOT_FOUND", "Not found");
  return res.json({ task });
});

export const updateTask = asyncHandler(async (req: AuthedRequest, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  const input = req.body as {
    title?: string;
    description?: string | null;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: Date | null;
  };

  const data: tasksService.UpdateTaskInput = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description;
  if (input.status !== undefined) data.status = input.status;
  if (input.priority !== undefined) data.priority = input.priority;
  if (input.dueDate !== undefined) data.dueDate = input.dueDate;

  if (Object.keys(data).length === 0) throw new ApiError(400, "VALIDATION_ERROR", "No fields to update");

  const task = await tasksService.updateTask({ id, userId: req.user!.id, data });
  // Emit update event
  io?.emit("task:updated", { task });
  if (!task) throw new ApiError(404, "NOT_FOUND", "Not found");
  return res.json({ task });
});

export const deleteTask = asyncHandler(async (req: AuthedRequest, res: Response, next: NextFunction) => {
  const id = req.params.id as string;

  const deleted = await tasksService.deleteTask({ id, userId: req.user!.id });
  if (deleted === 0) throw new ApiError(404, "NOT_FOUND", "Not found");
  // Emit delete event
  io?.emit("task:deleted", { taskId: id });
  return res.status(204).send();
});

export const getTaskStats = asyncHandler(async (req: AuthedRequest, res: Response, next: NextFunction) => {
  const stats = await tasksService.getTaskStats(req.user!.id);
  return res.json(stats);
});

// Dashboard endpoint – returns overall task completion stats for the authenticated user
export const getDashboardStats = asyncHandler(async (req: AuthedRequest, res: Response, next: NextFunction) => {
  const stats = await tasksService.getDashboardStats(req.user!.id);
  return res.json(stats);
});
