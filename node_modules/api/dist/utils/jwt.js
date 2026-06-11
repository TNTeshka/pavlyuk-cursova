import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET)
    throw new Error("Missing JWT_SECRET");
export function signAccessToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}
export function verifyAccessToken(token) {
    return jwt.verify(token, JWT_SECRET);
}
