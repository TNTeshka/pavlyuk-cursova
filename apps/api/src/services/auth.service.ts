import { prisma } from "../prisma.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

export async function registerUser(input: { email: string; password: string; username?: string; name?: string }) {
  // Check email uniqueness
  const existingEmail = await prisma.user.findUnique({ where: { email: input.email } });
  if (existingEmail) return null;

  // If a username is provided, ensure it is unique (now stored in `username` field)
  if (input.username) {
    const existingUsername = await prisma.user.findUnique({ where: { username: input.username } });
    if (existingUsername) return null;
  }

  try {
    return await prisma.user.create({
      data: {
        email: input.email,
        passwordHash: await hashPassword(input.password),
        // Store provided username (required) and optional full name
        username: input.username?.trim() ?? null,
        name: input.name?.trim() ?? null,
      },
      select: { id: true, email: true, username: true, name: true, createdAt: true },
    });
  } catch (e: any) {
    // Prisma unique‑constraint violation (duplicate email or username)
    if (e.code === 'P2002') {
      // Return null so the controller can respond with a 409 Conflict
      return null;
    }
    // Unexpected errors should propagate
    throw e;
  }
}

export async function verifyLogin(input: { login: string; password: string }) {
  // Try to find by email first, then by username (now stored in `username` field)
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: input.login }, { username: input.login }],
    },
  });
  if (!user) return null;
  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) return null;
  return user;
}

