import type { Request, Response, NextFunction } from "express";
import * as usersService from "../../services/users.service.js";

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  const q = ((req.query as any).q as string | undefined) ?? "";
  const users = await usersService.listUsers({ q });

  // Transform users to include tasksCount field for the admin UI
  const transformed = users.map((u: any) => ({
    ...u,
    tasksCount: u._count?.tasks ?? 0,
    _count: undefined,
  }));

  res.json(transformed);
}
