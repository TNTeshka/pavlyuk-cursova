import { verifyAccessToken } from "../utils/jwt.js";
export function auth(req, res, next) {
    const header = req.header("authorization");
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token)
        return res.status(401).json({ error: { message: "Missing token" } });
    try {
        const payload = verifyAccessToken(token);
        req.user = { id: payload.userId };
        next();
    }
    catch {
        return res.status(401).json({ error: { message: "Invalid token" } });
    }
}
