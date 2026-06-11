import { Prisma } from "@prisma/client";
import { z } from "zod";
export class ApiError extends Error {
    status;
    code;
    details;
    constructor(status, code, message, details) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
    }
}
function sendError(res, status, code, message, details) {
    return res.status(status).json({ error: { code, message, ...(details === undefined ? {} : { details }) } });
}
function prismaKnownErrorToApi(err) {
    switch (err.code) {
        case "P2002":
            return new ApiError(409, "CONFLICT", "Unique constraint failed", { prisma: { code: err.code, meta: err.meta } });
        case "P2025":
            return new ApiError(404, "NOT_FOUND", "Not found", { prisma: { code: err.code, meta: err.meta } });
        default:
            return new ApiError(400, "PRISMA_ERROR", "Database error", { prisma: { code: err.code, meta: err.meta } });
    }
}
export function errorHandler(err, _req, res, _next) {
    if (res.headersSent)
        return;
    if (err instanceof ApiError) {
        return sendError(res, err.status, err.code, err.message, err.details);
    }
    if (err instanceof z.ZodError) {
        return sendError(res, 400, "VALIDATION_ERROR", "Invalid request", {
            issues: err.issues.map((i) => ({
                path: i.path.join("."),
                message: i.message,
                code: i.code
            }))
        });
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        const apiErr = prismaKnownErrorToApi(err);
        return sendError(res, apiErr.status, apiErr.code, apiErr.message, apiErr.details);
    }
    if (err instanceof Prisma.PrismaClientValidationError) {
        return sendError(res, 400, "VALIDATION_ERROR", "Invalid database query");
    }
    if (err instanceof Prisma.PrismaClientInitializationError) {
        return sendError(res, 503, "DB_UNAVAILABLE", "Database unavailable");
    }
    console.error(err);
    return sendError(res, 500, "INTERNAL_SERVER_ERROR", "Internal server error");
}
