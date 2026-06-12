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
        const data = await api<UserRow[]>("/api/users");
        setUsers(data);
        setError(null);
      } catch (e: any) {
        setError(e?.message ?? "Не вдалося завантажити користувачів");
      } finally {
        setLoading(false);
      }
    };
    const fetchGroups = async () => {
      try {
        const data = await api<GroupRow[]>("/api/groups");
        setGroups(data);
      } catch {
        // ignore groups errors for now
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchUsers();
    fetchGroups();
  }, []);

  if (loading) {
    return <div className="text-sm text-[var(--color-muted)]">Завантаження користувачів…</div>;
  }
  if (error) {
    return <div className="alert alert--error">{error}</div>;
  }

  return (
    <div className="admin-page">
      <h1 className="text-2xl font-semibold mb-4 text-[var(--color-text)]">Адмін — Користувачі</h1>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2 text-[var(--color-text)]">ID</th>
            <th className="text-left p-2 text-[var(--color-text)]">Електронна пошта</th>
            <th className="text-left p-2 text-[var(--color-text)]">Ім'я</th>
            <th className="text-left p-2 text-[var(--color-text)]">Задачі</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="p-2 text-sm text-[var(--color-text)] break-all">{u.id}</td>
              <td className="p-2 text-sm text-[var(--color-text)]">{u.email}</td>
              <td className="p-2 text-sm text-[var(--color-text)]">{u.name ?? "—"}</td>
              <td className="p-2 text-sm text-[var(--color-text)]">{u.tasksCount ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-xl font-semibold mb-3 text-[var(--color-text)]">Групи</h2>
      {loadingGroups ? (
        <div className="text-sm text-[var(--color-muted)]">Завантаження груп…</div>
      ) : (
        <table className="w-full border-collapse mb-6">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2 text-[var(--color-text)]">ID</th>
              <th className="text-left p-2 text-[var(--color-text)]">Назва</th>
              <th className="text-left p-2 text-[var(--color-text)]">Власник</th>
              <th className="text-left p-2 text-[var(--color-text)]">Учасники</th>
              <th className="text-left p-2 text-[var(--color-text)]">Опис</th>
              <th className="text-left p-2 text-[var(--color-text)]">Задачі</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr key={g.id} className="border-b">
                <td className="p-2 text-sm text-[var(--color-text)] break-all">{g.id}</td>
                <td className="p-2 text-sm text-[var(--color-text)]">{g.name}</td>
                <td className="p-2 text-sm text-[var(--color-text)]">{g.ownerName ?? "—"}</td>
                <td className="p-2 text-sm text-[var(--color-text)]">{g.membersCount ?? "—"}</td>
                <td className="p-2 text-sm text-[var(--color-muted)]">{g.description ?? "—"}</td>
                <td className="p-2 text-sm text-[var(--color-text)]">{g.tasksCount ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="mt-4">
        <Button variant="primary" size="sm" onClick={() => alert("Адмін-дії ще не реалізовані.")}>
          Додати дію
        </Button>
      </div>
    </div>
  );
}
