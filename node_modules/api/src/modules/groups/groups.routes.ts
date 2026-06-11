import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { z } from "zod";
import { createGroup, listGroups, getGroupTasks, createGroupTask, addUser, removeUser, getGroupMembers, updateGroupTask, deleteGroupTask } from "./groups.controller.js";
import { createTaskBody } from "../tasks/tasks.routes.js";

export const groupsRoutes = Router();

// Validation schema for creating a group
const createGroupBody = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  password: z.string().optional()
});

groupsRoutes.get('/:id/users', auth, getGroupMembers);
const addUserBody = z.object({
  userId: z.string(),
  password: z.string().optional()
});

// All group routes are protected

groupsRoutes.post("/", auth, validate({ body: createGroupBody }), createGroup);

groupsRoutes.get("/", auth, listGroups);

groupsRoutes.get("/:id/tasks", auth, getGroupTasks);

groupsRoutes.post("/:id/tasks", auth, validate({ body: createTaskBody }), createGroupTask);
// Update and delete a specific group task
groupsRoutes.patch('/:id/tasks/:taskId', auth, updateGroupTask);
groupsRoutes.delete('/:id/tasks/:taskId', auth, deleteGroupTask);

groupsRoutes.post("/:id/users", auth, validate({ body: addUserBody }), addUser);

groupsRoutes.delete("/:id/users/:userId", auth, removeUser);
