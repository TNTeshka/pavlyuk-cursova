import { io } from "../../socket";
import type { AuthedRequest } from "../../middleware/auth.js";
import type { Response, NextFunction } from "express";
import * as groupsService from "../../services/groups.service.js";
import { verifyPassword } from "../../utils/password.js";
import { prisma } from "../../prisma.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { ApiError } from "../../middleware/error.js";

export const createGroup = asyncHandler(async (req: AuthedRequest, res: Response, next: NextFunction) => {
  const { name, description, password } = req.body as {
    name: string;
    description?: string;
    password?: string
  };

  if (!name?.trim()) throw new ApiError(400, "VALIDATION_ERROR", "Group name required");

  const group = await groupsService.createGroup({
    name: name.trim(),
    description,
    password,
    userId: req.user!.id
  });

  const transformed = {
    ...group,
    tasksCount: 0,
    membersCount: group._count?.members ?? (group.members?.length ?? 0),
    ownerName: group.owner?.name ?? group.owner?.email ?? "-",
    ownerId: group.ownerId,
    owner: group.owner ? {
      id: group.owner.id,
      name: group.owner.name,
      email: group.owner.email
    } : undefined,
    _count: undefined,
  };

  io?.emit("group:created", { group: transformed });
  return res.status(201).json({ group: transformed });
});

export const listGroups = asyncHandler(async (req: AuthedRequest, res: Response, next: NextFunction) => {
  const groups = await groupsService.listGroups(req.user!.id);

  const transformed = groups.map((g: any) => ({
    ...g,
    tasksCount: g._count?.tasks ?? 0,
    membersCount: g._count?.members ?? 0,
    ownerName: g.owner?.name ?? g.owner?.email ?? "-",
    ownerId: g.ownerId,
    owner: g.owner ? {
      id: g.owner.id,
      name: g.owner.name,
      email: g.owner.email
    } : undefined,
    _count: undefined,
  }));

  return res.json(transformed);
});

export const getGroupTasks = asyncHandler(async (req: AuthedRequest, res: Response, next: NextFunction) => {
  const groupId = req.params.id as string;
  const tasks = await groupsService.getGroupTasks(groupId, req.user!.id);
  return res.json({ tasks });
});

export const getGroupMembers = asyncHandler(async (req: AuthedRequest, res: Response, next: NextFunction) => {
  const groupId = req.params.id as string;
  const data = await groupsService.getGroupMembers(groupId);
  return res.json(data);
});

export const createGroupTask = asyncHandler(async (req: AuthedRequest, res: Response, next: NextFunction) => {
  const groupId = req.params.id as string;
  const userId = req.user!.id;

  const input = req.body as {
    title: string;
    description?: string | null;
    status?: any;
    priority?: any;
    deadline?: string | null
  };

  const task = await groupsService.createGroupTask(groupId, userId, {
    title: input.title,
    description: input.description,
    status: input.status,
    priority: input.priority,
    dueDate: input.deadline ? new Date(input.deadline) : undefined,
  });

  io?.emit("task:created", { task });
  return res.status(201).json({ task });
});

export const updateGroupTask = asyncHandler(async (req: AuthedRequest, res: Response, next: NextFunction) => {
  const groupId = req.params.id as string;
  const taskId = req.params.taskId as string;
  const userId = req.user!.id;

  const input = req.body as {
    status?: any;
    priority?: any;
    description?: string | null;
    deadline?: string | null
  };

  const task = await groupsService.updateGroupTask(groupId, userId, taskId, {
    status: input.status,
    priority: input.priority,
    description: input.description,
    deadline: input.deadline ? input.deadline : undefined,
  });

  if (!task) throw new ApiError(404, "NOT_FOUND", "Task not found");

  io?.emit("task:updated", { task });
  return res.json({ task });
});

export const deleteGroupTask = asyncHandler(async (req: AuthedRequest, res: Response, next: NextFunction) => {
  const groupId = req.params.id as string;
  const taskId = req.params.taskId as string;
  const userId = req.user!.id;

  const deleted = await groupsService.deleteGroupTask(groupId, userId, taskId);
  if (deleted === 0) throw new ApiError(404, "NOT_FOUND", "Task not found");

  io?.emit("task:deleted", { taskId });
  return res.status(204).send();
});

export const addUser = asyncHandler(async (req: AuthedRequest, res: Response, next: NextFunction) => {
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

  io?.emit("group:user-added", { groupId, userId });
  return res.json({ group });
});

export const removeUser = asyncHandler(async (req: AuthedRequest, res: Response, next: NextFunction) => {
  const groupId = req.params.id as string;
  const userId = req.params.userId as string;
  const group = await groupsService.removeUserFromGroup(groupId, userId, req.user!.id);

  io?.emit("group:user-removed", { groupId, userId });
  return res.json({ group });
});

export const updateGroup = asyncHandler(async (req: AuthedRequest, res: Response, next: NextFunction) => {
  const groupId = req.params.id as string;
  const { name, description, password } = req.body as {
    name?: string;
    description?: string | null;
    password?: string | null
  };

  const group = await groupsService.updateGroup(groupId, req.user!.id, { name, description, password });

  const transformed = {
    ...group,
    tasksCount: group._count?.tasks ?? 0,
    membersCount: group._count?.members ?? (group.members?.length ?? 0),
    ownerName: group.owner?.name ?? group.owner?.email ?? "-",
    ownerId: group.ownerId,
    owner: group.owner ? {
      id: group.owner.id,
      name: group.owner.name,
      email: group.owner.email
    } : undefined,
    _count: undefined,
  };

  io?.emit("group:updated", { group: transformed });
  return res.json({ group: transformed });
});