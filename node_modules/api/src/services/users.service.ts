import { prisma } from "../prisma.js";

export async function listUsers(input: { q?: string }) {
  const q = input.q ?? "";
  return prisma.user.findMany({
    where: q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } }
          ]
        }
      : undefined,
    select: {
      id: true,
      email: true,
      name: true,
      _count: { select: { tasks: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 50
  });
}

