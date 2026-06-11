import { useCallback, useEffect, useState } from "react";
import { useTaskStore } from "../store/taskStore";
import { api } from "../api";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  notes?: string;
  deadline?: string | null;
};

export type TaskStats = {
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
};

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);

  const setAllStore = useTaskStore(state => state.setAll);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statsError, setStatsError] = useState<string | null>(null);
  const refreshAll = useCallback(async () => {
    setLoading(true);
    setStatsLoading(true);
    try {
      const [t, s] = await Promise.all([api<{ tasks: Task[] }>("/api/tasks"), api<TaskStats>("/api/tasks/stats")]);
      setTasks(t.tasks);
      setAllStore(t.tasks);
      setStats(s);
      setError(null);
      setStatsError(null);
    } catch (e: any) {
      const msg = e?.message ?? "Не вдалося виконати запит";
      setError(msg);
      setStatsError(msg);
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const createTask = useCallback(
    async (input: { title: string; status: TaskStatus; description?: string; notes?: string; deadline?: string }) => {
      await api("/api/tasks", { method: "POST", body: JSON.stringify(input) });
      await refreshAll();
    },
    [refreshAll]
  );

  const updateTask = useCallback(
    async (id: string, input: Partial<Pick<Task, "status" | "priority" | "description" | "notes" | "deadline">>) => {
      await api(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(input) });
      await refreshAll();
    },
    [refreshAll]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      await api(`/api/tasks/${id}`, { method: "DELETE" });
      await refreshAll();
    },
    [refreshAll]
  );

  return {
    tasks,
    stats,
    loading,
    error,
    statsLoading,
    statsError,
    refreshAll,
    createTask,
    updateTask,
    deleteTask
  };
}

