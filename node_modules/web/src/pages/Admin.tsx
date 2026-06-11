import { useEffect, useState } from "react";
import { api } from "../api";
import { Button } from "../components/Button";

interface UserRow {
  id: string;
  email: string;
  name?: string | null;
  tasksCount?: number;
}

interface GroupRow {
  id: string;
  name: string;
  description?: string | null;
  tasksCount?: number;
  ownerName?: string;
  membersCount?: number;
}

export function Admin() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [loadingGroups, setLoadingGroups] = useState<boolean>(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // GET /api/users – auth middleware will protect the endpoint
        const data = await api<UserRow[]>("/api/users");
        setUsers(data);
        setError(null);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    const fetchGroups = async () => {
      try {
        const data = await api<GroupRow[]>("/api/groups");
        setGroups(data);
      } catch (e: any) {
        // ignore groups errors for now
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchUsers();
    fetchGroups();
  }, []);

  if (loading) {
    return <div className="text-sm text-[var(--color-muted)]">Loading users…</div>;
  }
  if (error) {
    return <div className="text-rose-500 text-sm">{error}</div>;
  }

  return (
    <div className="admin-page">
      <h1 className="text-2xl font-semibold mb-4 text-[var(--color-text)]">Admin – Users</h1>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2 text-[var(--color-text)]">ID</th>
            <th className="text-left p-2 text-[var(--color-text)]">Email</th>
            <th className="text-left p-2 text-[var(--color-text)]">Name</th>
            <th className="text-left p-2 text-[var(--color-text)]">Tasks</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="p-2 text-sm text-[var(--color-text)] break-all">{u.id}</td>
              <td className="p-2 text-sm text-[var(--color-text)]">{u.email}</td>
              <td className="p-2 text-sm text-[var(--color-text)]">{u.name ?? "-"}</td>
              <td className="p-2 text-sm text-[var(--color-text)]">{u.tasksCount ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-xl font-semibold mb-3 text-[var(--color-text)]">Groups</h2>
      {loadingGroups ? (
        <div className="text-sm text-[var(--color-muted)]">Loading groups…</div>
      ) : (
        <table className="w-full border-collapse mb-6">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2 text-[var(--color-text)]">ID</th>
              <th className="text-left p-2 text-[var(--color-text)]">Name</th>
              <th className="text-left p-2 text-[var(--color-text)]">Owner</th>
                <th className="text-left p-2 text-[var(--color-text)]">Members</th>
                <th className="text-left p-2 text-[var(--color-text)]">Description</th>
              <th className="text-left p-2 text-[var(--color-text)]">Tasks</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr key={g.id} className="border-b">
                <td className="p-2 text-sm text-[var(--color-text)] break-all text-[var(--color-text)]">{g.id}</td>
                <td className="p-2 text-sm text-[var(--color-text)] text-[var(--color-text)]">{g.name}</td>
                <td className="p-2 text-sm text-[var(--color-text)]">{g.ownerName ?? "-"}</td>
                <td className="p-2 text-sm text-[var(--color-text)]">{g.membersCount ?? "-"}</td>
                <td className="p-2 text-sm text-[var(--color-text)] text-[var(--color-muted)]">{g.description ?? "-"}</td>
                <td className="p-2 text-sm text-[var(--color-text)]">{g.tasksCount ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Placeholder for future admin actions */}
      <div className="mt-4">
        <Button variant="primary" size="sm" onClick={() => alert("Admin actions not implemented yet.")}>Add Action</Button>
      </div>
    </div>
  );
}
