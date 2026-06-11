import { useCallback, useEffect, useState } from "react";
import { api } from "../api";

type Group = {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  // members omitted for brevity
  owner?: { id: string; name?: string | null }; // added owner
};

type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: string | null;
  // other fields omitted
};

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<Group[]>("/api/groups");
      setGroups(data);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "Не вдалося виконати запит");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const createGroup = useCallback(async (input: { name: string; description?: string; password?: string }) => {
    await api("/api/groups", { method: "POST", body: JSON.stringify(input) });
    await fetchGroups();
  }, [fetchGroups]);

  const addUser = useCallback(async (groupId: string, userId: string, password?: string) => {
    await api(`/api/groups/${groupId}/users`, { method: "POST", body: JSON.stringify({ userId, password }) });
    await fetchGroups();
  }, []);

  const removeUser = useCallback(async (groupId: string, userId: string) => {
    await api(`/api/groups/${groupId}/users/${userId}`, { method: "DELETE" });
    await fetchGroups();
  }, []);

  const getGroupTasks = useCallback(async (groupId: string) => {
    const data = await api<{ tasks: Task[] }>(`/api/groups/${groupId}/tasks`);
    return data.tasks;
  }, []);

  // Fetch members of a group
  const getGroupMembers = useCallback(async (groupId: string) => {
    const data = await api<{ members: any[] }>(`/api/groups/${groupId}/users`);
    return data.members;
  }, []);

  return { groups, loading, error, fetchGroups, createGroup, addUser, removeUser, getGroupTasks, getGroupMembers };
}
