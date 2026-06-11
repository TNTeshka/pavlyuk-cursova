import { Router } from "express";
import { z } from "zod";
import { login, register } from "./auth.controller.js";
import { validate } from "../../middleware/validate.js";
export const authRoutes = Router();
const registerBody = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(1).optional()
});
const loginBody = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});
authRoutes.post("/register", validate({ body: registerBody }), register);
authRoutes.post("/login", validate({ body: loginBody }), login);
