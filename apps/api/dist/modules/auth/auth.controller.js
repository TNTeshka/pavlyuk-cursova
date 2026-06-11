import { prisma } from "../../prisma.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";
import { signAccessToken } from "../../utils/jwt.js";
export async function register(req, res) {
    const input = req.body;
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing)
        return res.status(409).json({ error: { message: "Email already in use" } });
    const user = await prisma.user.create({
        data: {
            email: input.email,
            passwordHash: await hashPassword(input.password),
            name: input.name
        },
        select: { id: true, email: true, name: true, createdAt: true }
    });
    const token = signAccessToken({ userId: user.id });
    res.json({ user, token });
}
export async function login(req, res) {
    const input = req.body;
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user)
        return res.status(401).json({ error: { message: "Invalid credentials" } });
    const ok = await verifyPassword(input.password, user.passwordHash);
    if (!ok)
        return res.status(401).json({ error: { message: "Invalid credentials" } });
    const token = signAccessToken({ userId: user.id });
    res.json({
        user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
        token
    });
}
