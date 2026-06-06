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
    include: { members: true },
  });
}

export async function listGroups(userId: string) {
  // Return groups where the user is a member (including owned groups), and include number of tasks per group
  return prisma.group.findMany({
    where: { members: { some: { id: userId } } },
    include: {
      members: true,
      owner: true,
      _count: { select: { tasks: true } }
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
    include: { members: true },
  });
}

export async function getGroupMembers(groupId: string) {
  // Return members of a group, including owner info if needed
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: true, owner: true },
  });
  if (!group) throw new ApiError(404, "NOT_FOUND", "Group not found");
  return { members: group.members };
}

// New functions for group task support
export async function getGroupTasks(groupId: string, userId: string) {
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

export async function createGroupTask(groupId: string, userId: string, input: { title: string; description?: string | null; status?: any; priority?: any; dueDate?: Date | null }) {
  // Verify group exists and user is a member
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: true }
  });
  if (!group) throw new ApiError(404, 'NOT_FOUND', 'Group not found');
  const isMember = group.members.some(m => m.id === userId);
  if (!isMember) throw new ApiError(403, 'FORBIDDEN', 'Access denied to group tasks');
  return prisma.task.create({
    data: {
      title: input.title,
      description: input.description ?? null,
      status: input.status,
      priority: input.priority,
      dueDate: input.dueDate,
      userId,
      groupId,
    }
  });
}

