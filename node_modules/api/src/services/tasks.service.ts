import { TaskPriority, TaskStatus, type Prisma, type Task } from "@prisma/client";
import { prisma } from "../prisma.js";

export type CreateTaskInput = {
  userId: string;
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | null;
};

export type UpdateTaskInput = Partial<Pick<Task, "title" | "description" | "status" | "priority" | "dueDate">>;

export async function createTask(input: CreateTaskInput) {
  return prisma.task.create({
    data: {
      userId: input.userId,
      creatorId: input.userId,
      assigneeId: null,
      title: input.title,
      ...(input.description === undefined ? {} : { description: input.description }),
      ...(input.status === undefined ? {} : { status: input.status }),
      ...(input.priority === undefined ? {} : { priority: input.priority }),
      ...(input.dueDate === undefined ? {} : { dueDate: input.dueDate })
    }
  });
}

export async function listTasks(input: { userId: string; status?: TaskStatus; priority?: TaskPriority }) {
  return prisma.task.findMany({
    where: {
      userId: input.userId,
      groupId: null,
      ...(input.status ? { status: input.status } : {}),
      ...(input.priority ? { priority: input.priority } : {})
    },
    orderBy: { updatedAt: "desc" }
  });
}

export async function getTask(input: { userId: string; id: string }) {
  return prisma.task.findFirst({
    where: { id: input.id, userId: input.userId, groupId: null }
  });
}

export async function updateTask(input: { userId: string; id: string; data: UpdateTaskInput }) {
  const result = await prisma.task.updateMany({
    where: { id: input.id, userId: input.userId, groupId: null },
    data: input.data as Prisma.TaskUpdateManyMutationInput
  });
  if (result.count === 0) return null;
  return getTask({ userId: input.userId, id: input.id });
}

export async function deleteTask(input: { userId: string; id: string }) {
  const result = await prisma.task.deleteMany({
    where: { id: input.id, userId: input.userId, groupId: null }
  });
  return result.count;
}

export type TaskStats = {
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
};

export async function getDashboardStats(userId: string) {
  const [doneCount, pendingCount, overdueCount] = await Promise.all([
    prisma.task.count({ where: { userId, status: "DONE", groupId: null } }),
    prisma.task.count({ where: { userId, NOT: { status: "DONE" }, groupId: null } }),
    prisma.task.count({ where: { userId, status: { not: "DONE" }, dueDate: { lt: new Date() }, groupId: null } })
  ]);
  return { done: doneCount, pending: pendingCount, overdue: overdueCount };
}

export async function getTaskStats(userId: string): Promise<TaskStats> {
  const byStatus: Record<TaskStatus, number> = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
  const byPriority: Record<TaskPriority, number> = { LOW: 0, MEDIUM: 0, HIGH: 0 };

  try {
    const [statusGroups, priorityGroups] = await Promise.all([
      prisma.task.groupBy({ by: ["status"], where: { userId, groupId: null }, _count: { _all: true } }),
      prisma.task.groupBy({ by: ["priority"], where: { userId, groupId: null }, _count: { _all: true } })
    ]);

    for (const row of statusGroups) byStatus[row.status] = row._count._all;
    for (const row of priorityGroups) byPriority[row.priority] = row._count._all;
    return { byStatus, byPriority };
  } catch {
    const tasks = await prisma.task.findMany({ where: { userId, groupId: null }, select: { status: true, priority: true } });
    for (const t of tasks) {
      byStatus[t.status] = (byStatus[t.status] ?? 0) + 1;
      byPriority[t.priority] = (byPriority[t.priority] ?? 0) + 1;
    }
    return { byStatus, byPriority };
  }
}


