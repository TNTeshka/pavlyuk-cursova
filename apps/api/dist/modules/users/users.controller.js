import { prisma } from "../../prisma.js";
export async function listUsers(req, res) {
    const q = req.query.q ?? "";
    const users = await prisma.user.findMany({
        where: q
            ? {
                OR: [
                    { email: { contains: q, mode: "insensitive" } },
                    { name: { contains: q, mode: "insensitive" } }
                ]
            }
            : undefined,
        select: { id: true, email: true, name: true },
        orderBy: { createdAt: "desc" },
        take: 50
    });
    res.json({ users });
}
