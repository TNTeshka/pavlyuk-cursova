import { ApiError } from "../middleware/error.js";
import { hashPassword } from "../utils/password.js";
import { prisma } from "../prisma.js";

type Group = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  members: any[]; // simplified; actual type from Prisma
};

export async function createGroup(input: { name: string; description?: string; password?: string; userId: string }) {
  // Ensure group name is unique
  const existing = await prisma.group.findUnique({ where: { name: input.name } });
  if (existing) throw new ApiError(409, "CONFLICT", "Group name already exists");
  return prisma.group.create({
    data: {
      name: input.name,
      description: input.description ?? null,
      passwordHash: input.password ? await hashPassword(input.password) : undefined,
      owner: { connect: { id: input.userId } }, // set owner
      members: { connect: { id: input.userId } }, // owner is also a member
    },
    include: { members: true, owner: true, _count: { select: { tasks: true, members: true } } },
  });
}

export async function listGroups(userId: string) {
  // Return groups where the user is a member (including owned groups), and include number of tasks per group
  return prisma.group.findMany({
    where: { members: { some: { id: userId } } },
    include: {
      members: true,
      owner: true,
      _count: { select: { tasks: true, members: true } }
    }
  });
}


export async function addUserToGroup(groupId: string, userId: string) {
  // Ensure group exists
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) throw new ApiError(404, "NOT_FOUND", "Group not found");
  // Connect user as a member
  return prisma.group.update({
    where: { id: groupId },
    data: { members: { connect: { id: userId } } },
    include: { members: true, owner: true, _count: { select: { tasks: true, members: true } } },
  });
}

// Create a new task within a group
export async function createGroupTask(
  groupId: string,
  userId: string,
  input: {
    title: string;
    description?: string | null;
    status?: any;
    priority?: any;
    dueDate?: Date | null;
    deadline?: Date | null;
  }
) {
  // Verify group exists and user is a member
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: true },
  });
  if (!group) throw new ApiError(404, 'NOT_FOUND', 'Group not found');
  const isMember = group.members.some((m: any) => m.id === userId);
  if (!isMember) throw new ApiError(403, 'FORBIDDEN', 'Access denied to group tasks');

  const data: any = {
    title: input.title,
    userId,
    creatorId: userId,
    assigneeId: null,
    groupId,
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.priority !== undefined ? { priority: input.priority } : {}),
    ...(input.deadline !== undefined ? { dueDate: input.deadline } : {}),
    ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {}),
  };
  return prisma.task.create({ data });
}

export async function getGroupMembers(groupId: string) {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: { select: { id: true, name: true, email: true, username: true } },
      owner: { select: { id: true, name: true, email: true, username: true } },
    },
  });
  if (!group) throw new ApiError(404, "NOT_FOUND", "Group not found");
  return {
    members: group.members,
    ownerId: group.ownerId,
    owner: group.owner,
  };
}

export async function removeUserFromGroup(groupId: string, targetUserId: string, actorUserId: string) {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: true },
  });
  if (!group) throw new ApiError(404, "NOT_FOUND", "Group not found");

  const isOwner = group.ownerId === actorUserId;
  const isSelf = targetUserId === actorUserId;
  const targetIsOwner = group.ownerId === targetUserId;

  if (targetIsOwner && !isSelf) {
    throw new ApiError(403, "FORBIDDEN", "Cannot remove group owner");
  }
  if (targetIsOwner && isSelf) {
    throw new ApiError(403, "FORBIDDEN", "Owner cannot leave the group");
  }
  if (!isSelf && !isOwner) {
    throw new ApiError(403, "FORBIDDEN", "Only group owner can remove members");
  }

  const isMember = group.members.some((m) => m.id === targetUserId);
  if (!isMember) throw new ApiError(404, "NOT_FOUND", "User is not a member");

  return prisma.group.update({
    where: { id: groupId },
    data: { members: { disconnect: { id: targetUserId } } },
    include: { members: true, owner: true, _count: { select: { tasks: true, members: true } } },
  });
}

export async function updateGroup(
  groupId: string,
  actorUserId: string,
  input: { name?: string; description?: string | null; password?: string | null }
) {
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) throw new ApiError(404, "NOT_FOUND", "Group not found");
  if (group.ownerId !== actorUserId) {
    throw new ApiError(403, "FORBIDDEN", "Only group owner can update settings");
  }

  const data: Record<string, unknown> = {};

  if (input.description !== undefined) {
    data.description = input.description;
  }

  if (input.password !== undefined) {
    data.passwordHash =
      input.password && input.password.trim()
        ? await hashPassword(input.password.trim())
        : null;
  }

  if (input.name !== undefined) {
    const trimmed = input.name.trim();
    if (!trimmed) throw new ApiError(400, "VALIDATION_ERROR", "Group name required");
    const existing = await prisma.group.findFirst({
      where: { name: trimmed, NOT: { id: groupId } },
    });
    if (existing) throw new ApiError(409, "CONFLICT", "Group name already exists");
    data.name = trimmed;
  }

  return prisma.group.update({
    where: { id: groupId },
    data,
    include: { members: true, owner: true, _count: { select: { tasks: true, members: true } } },
  });
}

// New functions for group task support
export async function getGroupTasks(groupId: string, userId: string) {
  // existing implementation unchanged
  // Verify group exists and user is a member
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: true }
  });
  if (!group) throw new ApiError(404, 'NOT_FOUND', 'Group not found');
  const isMember = group.members.some(m => m.id === userId);
  if (!isMember) throw new ApiError(403, 'FORBIDDEN', 'Access denied to group tasks');
  return prisma.task.findMany({ where: { groupId } });
}

export async function updateGroupTask(groupId: string, userId: string, taskId: string, input: { status?: any; priority?: any; description?: string | null; deadline?: string | null }) {
  // Verify group exists and user is a member
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: true }
  });
  if (!group) throw new ApiError(404, 'NOT_FOUND', 'Group not found');
  const isMember = group.members.some(m => m.id === userId);
  if (!isMember) throw new ApiError(403, 'FORBIDDEN', 'Access denied to group tasks');

  const data: any = {};
  if (input.status !== undefined) data.status = input.status;
  if (input.priority !== undefined) data.priority = input.priority;
  if (input.description !== undefined) data.description = input.description;
  if (input.deadline !== undefined) data.dueDate = input.deadline;

  const result = await prisma.task.updateMany({
    where: { id: taskId, groupId },
    data,
  });
  if (result.count === 0) return null;
  return prisma.task.findUnique({ where: { id: taskId } });
}

export async function deleteGroupTask(groupId: string, userId: string, taskId: string) {
  // Verify group exists and user is a member
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: true }
  });
  if (!group) throw new ApiError(404, 'NOT_FOUND', 'Group not found');
  const isMember = group.members.some(m => m.id === userId);
  if (!isMember) throw new ApiError(403, 'FORBIDDEN', 'Access denied to group tasks');

  const result = await prisma.task.deleteMany({
    where: { id: taskId, groupId },
  });
  return result.count;
}

