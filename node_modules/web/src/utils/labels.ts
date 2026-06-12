import type { TaskPriority, TaskStatus } from "../hooks/useTasks";

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "До виконання",
  IN_PROGRESS: "В процесі",
  DONE: "Виконано",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Низький",
  MEDIUM: "Середній",
  HIGH: "Високий",
};
