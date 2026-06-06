import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useGroupStore } from "../store/groupStore";
import { GroupModal } from "../components/GroupModal";
import { Button } from "../components/Button";

export function Groups() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const groups = Object.values(useGroupStore(state => state.groups));

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await api<any[]>("/api/groups");
        useGroupStore.getState().setAll(data);
        setError(null);
      } catch (e: any) {
        setError(e?.message ?? "Request failed");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="grid gap-5">
      <div className="card">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">Groups</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Shared spaces for focused collaboration.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Create group</Button>
      </div>

      {loading && <div className="text-sm text-[var(--color-muted)]">Loading…</div>}
      {error && <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {groups.map((g) => (
          <Button
            key={g.id}
            type="button"
            variant="ghost"
            onClick={() => navigate(`/groups/${g.id}/tasks`)}
            className="card"
          >
            <div className="text-base font-semibold tracking-tight text-[var(--color-text)]">{g.name}</div>
            <div className="mt-2 text-sm text-[var(--color-muted)]">{g.description || "No description yet."}</div>
          </Button>
        ))}
      </div>

      {!loading && groups.length === 0 && (
        <div className="card">
          No groups yet. Create one to organize your team work.
        </div>
      )}

      <GroupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
