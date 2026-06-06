import { io } from "../../socket";
import type { AuthedRequest } from "../../middleware/auth.js";
import * as groupsService from "../../services/groups.service.js";
import { verifyPassword } from "../../utils/password.js";
import { prisma } from "../../prisma.js";

import { asyncHandler } from "../../middleware/asyncHandler.js";
import { ApiError } from "../../middleware/error.js";
export const createGroup = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { name, description, password } = req.body as { name: string; description?: string; password?: string };
  if (!name?.trim()) throw new ApiError(400, "VALIDATION_ERROR", "Group name required");
  const group = await groupsService.createGroup({ name: name.trim(), description, password, userId: req.user!.id });
  // Emit group creation event
  io?.emit("group:created", { group });
  return res.status(201).json({ group });
});

export const listGroups = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const groups = await groupsService.listGroups(req.user!.id);
  return res.json(groups);
});



export const getGroupMembers = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const groupId = req.params.id as string;
  const data = await groupsService.getGroupMembers(groupId);
  return res.json(data);
});
export const getGroupTasks = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const groupId = req.params.id as string;
  const tasks = await groupsService.getGroupTasks(groupId, req.user!.id);
  return res.json({ tasks });
});

export const createGroupTask = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const groupId = req.params.id as string;
  const userId = req.user!.id;
  const input = req.body as { title: string; description?: string | null; status?: any; priority?: any; deadline?: string | null };
  const task = await groupsService.createGroupTask(groupId, userId, {
    title: input.title,
    description: input.description,
    status: input.status,
    priority: input.priority,
    dueDate: input.deadline ?? undefined,
  });
  // Emit task creation event
  io?.emit("task:created", { task });
  return res.status(201).json({ task });
});

export const addUser = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const groupId = req.params.id as string;
  const { userId, password } = req.body as { userId: string; password?: string };
  if (!userId) throw new ApiError(400, "VALIDATION_ERROR", "userId required");
  const groupRecord = await prisma.group.findUnique({ where: { id: groupId } });
  if (!groupRecord) throw new ApiError(404, "NOT_FOUND", "Group not found");
  if (groupRecord.passwordHash) {
    if (!password) throw new ApiError(400, "VALIDATION_ERROR", "Password required");
    const ok = await verifyPassword(password, groupRecord.passwordHash);
    if (!ok) throw new ApiError(401, "UNAUTHORIZED", "Invalid password");
  }
  const group = await groupsService.addUserToGroup(groupId, userId);
  // Emit user added to group
  io?.emit("group:user-added", { groupId, userId });
  return res.json({ group });
});

// Remove a user from a group
export const removeUser = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const groupId = req.params.id as string;
  const userId = req.params.userId as string;
  const group = await groupsService.removeUserFromGroup(groupId, userId);
  // Emit user removed from group
  io?.emit("group:user-removed", { groupId, userId });
  return res.json({ group });
});
