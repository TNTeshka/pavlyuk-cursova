import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import { ApiError } from "./error.js";

export type AuthedRequest = Request & { user?: { id: string } };

export function auth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return next(new ApiError(401, "UNAUTHORIZED", "Missing token"));

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.userId };
    next();
  } catch {
    return next(new ApiError(401, "UNAUTHORIZED", "Invalid token"));
  }
}
