import { useCallback, useEffect, useState } from "react";
import { api } from "../api";

type Group = {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  ownerId?: string;
  owner?: { id: string; name?: string | null; email?: string };
};

type GroupMember = {
  id: string;
  name?: string | null;
  email?: string;
  username?: string | null;
};

type GroupMembersResponse = {
  members: GroupMember[];
  ownerId: string;
  owner: GroupMember;
};

type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: string | null;
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

  const updateGroup = useCallback(
    async (groupId: string, input: { name?: string; description?: string | null; password?: string | null }) => {
      await api(`/api/groups/${groupId}`, { method: "PATCH", body: JSON.stringify(input) });
      await fetchGroups();
    },
    [fetchGroups]
  );

  const addUser = useCallback(async (groupId: string, userId: string, password?: string) => {
    await api(`/api/groups/${groupId}/users`, { method: "POST", body: JSON.stringify({ userId, password }) });
    await fetchGroups();
  }, [fetchGroups]);

  const removeUser = useCallback(async (groupId: string, userId: string) => {
    await api(`/api/groups/${groupId}/users/${userId}`, { method: "DELETE" });
    await fetchGroups();
  }, [fetchGroups]);

  const getGroupTasks = useCallback(async (groupId: string) => {
    const data = await api<{ tasks: Task[] }>(`/api/groups/${groupId}/tasks`);
    return data.tasks;
  }, []);

  const getGroupMembers = useCallback(async (groupId: string) => {
    return api<GroupMembersResponse>(`/api/groups/${groupId}/users`);
  }, []);

  return {
    groups,
    loading,
    error,
    fetchGroups,
    createGroup,
    updateGroup,
    addUser,
    removeUser,
    getGroupTasks,
    getGroupMembers,
  };
}
