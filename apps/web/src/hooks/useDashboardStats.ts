import { useCallback, useEffect, useState } from "react";
import { api } from "../api";

type DashboardStats = {
  done: number;
  pending: number;
  overdue: number;
};

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const s = await api<DashboardStats>("/api/tasks/dashboard");
      setStats(s);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "Не вдалося виконати запит");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refresh: fetchStats };
}
