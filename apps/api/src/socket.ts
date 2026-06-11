import { Server as SocketIOServer } from "socket.io";
import type { Server as HttpServer } from "node:http";

export let io: SocketIOServer;

export function initSocket(server: HttpServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
      credentials: false
    }
  });

  io.on("connection", (socket) => {
    // Optional: handle authentication via token if needed.
    socket.on("joinUser", (userId: string) => {
      socket.join(`user:${userId}`);
    });
    socket.on("joinGroup", (groupId: string) => {
      socket.join(`group:${groupId}`);
    });
  });
}
