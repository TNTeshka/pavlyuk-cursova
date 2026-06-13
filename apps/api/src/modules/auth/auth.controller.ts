import type { Request, Response, NextFunction } from "express";
import { signAccessToken } from "../../utils/jwt.js";
import * as authService from "../../services/auth.service.js";
import { ApiError } from "../../middleware/error.js";

export async function register(req: Request, res: Response, next: NextFunction) {
  const input = req.body as { email: string; password: string; username?: string; name?: string };

  const user = await authService.registerUser(input);
  if (!user) throw new ApiError(409, "CONFLICT", "Email or username already in use");

  const token = signAccessToken({ userId: user.id });
  res.json({ user, token });
}

export async function login(req: Request, res: Response, next: NextFunction) {
  const input = req.body as { login: string; password: string };

  const user = await authService.verifyLogin(input);
  if (!user) throw new ApiError(401, "UNAUTHORIZED", "Invalid credentials");

  const token = signAccessToken({ userId: user.id });
  res.json({
    user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
    token
  });
}
