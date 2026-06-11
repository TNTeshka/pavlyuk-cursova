import { Router } from "express";
import { z } from "zod";
import { auth } from "../../middleware/auth.js";
import { listUsers } from "./users.controller.js";
import { validate } from "../../middleware/validate.js";
export const usersRoutes = Router();
const listUsersQuery = z.object({
    q: z.string().optional()
});
usersRoutes.get("/", auth, validate({ query: listUsersQuery }), listUsers);
