import { prisma } from "../../prisma.js";
export async function createTask(req, res) {
    const input = req.body;
    const task = await prisma.task.create({
        data: {
            userId: req.user.id,
            creatorId: req.user.id,
            assigneeId: null,
            title: input.title,
            ...(input.description === undefined ? {} : { description: input.description }),
            ...(input.status === undefined ? {} : { status: input.status }),
            ...(input.priority === undefined ? {} : { priority: input.priority }),
            ...(input.dueDate === undefined ? {} : { dueDate: input.dueDate })
        }
    });
    return res.status(201).json({ task });
}
export async function listTasks(req, res) {
    const status = req.query.status;
    const priority = req.query.priority;
    const tasks = await prisma.task.findMany({
        where: {
            userId: req.user.id,
            ...(status ? { status } : {}),
            ...(priority ? { priority } : {})
        },
        orderBy: { updatedAt: "desc" }
    });
    return res.json({ tasks });
}
export async function getTask(req, res) {
    const id = req.params.id;
    const task = await prisma.task.findFirst({
        where: { id, userId: req.user.id }
    });
    if (!task)
        return res.status(404).json({ error: { message: "Not found" } });
    return res.json({ task });
}
export async function updateTask(req, res) {
    const id = req.params.id;
    const input = req.body;
    const data = {};
    if (input.title !== undefined)
        data.title = input.title;
    if (input.description !== undefined)
        data.description = input.description;
    if (input.status !== undefined)
        data.status = input.status;
    if (input.priority !== undefined)
        data.priority = input.priority;
    if (input.dueDate !== undefined)
        data.dueDate = input.dueDate;
    if (Object.keys(data).length === 0)
        return res.status(400).json({ error: { message: "No fields to update" } });
    const result = await prisma.task.updateMany({
        where: { id, userId: req.user.id },
        data
    });
    if (result.count === 0)
        return res.status(404).json({ error: { message: "Not found" } });
    const task = await prisma.task.findFirst({ where: { id, userId: req.user.id } });
    return res.json({ task });
}
export async function deleteTask(req, res) {
    const id = req.params.id;
    const result = await prisma.task.deleteMany({
        where: { id, userId: req.user.id }
    });
    if (result.count === 0)
        return res.status(404).json({ error: { message: "Not found" } });
    return res.status(204).send();
}
export async function getTaskStats(req, res) {
    const byStatus = {
        TODO: 0,
        IN_PROGRESS: 0,
        DONE: 0
    };
    const byPriority = {
        LOW: 0,
        MEDIUM: 0,
        HIGH: 0
    };
    try {
        const [statusGroups, priorityGroups] = await Promise.all([
            prisma.task.groupBy({
                by: ["status"],
                where: { userId: req.user.id },
                _count: { _all: true }
            }),
            prisma.task.groupBy({
                by: ["priority"],
                where: { userId: req.user.id },
                _count: { _all: true }
            })
        ]);
        for (const row of statusGroups)
            byStatus[row.status] = row._count._all;
        for (const row of priorityGroups)
            byPriority[row.priority] = row._count._all;
        return res.json({ byStatus, byPriority });
    }
    catch {
        const tasks = await prisma.task.findMany({
            where: { userId: req.user.id },
            select: { status: true, priority: true }
        });
        for (const t of tasks) {
            byStatus[t.status] = (byStatus[t.status] ?? 0) + 1;
            byPriority[t.priority] = (byPriority[t.priority] ?? 0) + 1;
        }
        return res.json({ byStatus, byPriority });
    }
}
