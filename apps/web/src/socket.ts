import { io } from "socket.io-client";
import { useTaskStore } from "./store/taskStore";
import { useGroupStore } from "./store/groupStore";

export function initSocket() {
  const socket = io(import.meta.env.VITE_API_URL ?? "http://localhost:4000", { transports: ["websocket", "polling"] });

  socket.on("connect", () => {
    // optional authentication can be added here
  });

  socket.on("task:created", (payload) => {
    if (payload && payload.task) {
      useTaskStore.getState().addTask(payload.task);
    }
  });

  socket.on("task:updated", (payload) => {
    if (payload && payload.task) {
      useTaskStore.getState().updateTask(payload.task);
    }
  });

  socket.on("task:deleted", (payload) => {
    if (payload && payload.taskId) {
      useTaskStore.getState().removeTask(payload.taskId);
    }
  });

  socket.on("group:created", (payload) => {
    if (payload && payload.group) {
      useGroupStore.getState().addGroup(payload.group);
    }
  });

  socket.on("group:user-added", (payload) => {
    // For simplicity, we just refresh the group list – in a real app you’d update members
    // Here we could fetch group details again if needed
  });

  socket.on("group:user-removed", (payload) => {
    // Similar to user-added – could refetch members or update local state
  });

  return function cleanup() {
    socket.disconnect();
  };
}
