import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useGroups } from "../hooks/useGroups";
import { useTasks } from "../hooks/useTasks";
import { api } from "../api";


import { TaskModal } from "../components/TaskModal";
import { GroupMembersModal } from "../components/GroupMembersModal";
import { GroupDashboard } from "../components/GroupDashboard";







import { Task } from "../hooks/useTasks"; // reuse Task type














































export function GroupTasks() {
  const { groupId } = useParams<{ groupId: string }>();
  const { groups, loading: groupsLoading, error: groupsError, fetchGroups, getGroupTasks } = useGroups();
  const { updateTask, deleteTask } = useTasks();
  const safeGroups = groups ?? [];
  const group = safeGroups.find(g => g.id === groupId);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isMembersOpen, setIsMembersOpen] = useState(false);

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



  const handleCreateTask = async (input: { title: string; status: string; description?: string; notes?: string; deadline?: string }) => {
    if (!groupId) return;
    await api(`/api/groups/${groupId}/tasks`, { method: "POST", body: JSON.stringify(input) });
    // refresh tasks
    const refreshed = await getGroupTasks(groupId);
    setTasks(refreshed);
  };

  const handleUpdateTask = async (id: string, input: Partial<Pick<Task, 'status' | 'priority' | 'description' | 'notes' | 'deadline'>>) => {
    const { deadline, ...rest } = input as any;
    const payload: any = { ...rest };
    if (deadline) payload.dueDate = deadline;
    await updateTask(id, payload);
    const refreshed = await getGroupTasks(groupId!);
    setTasks(refreshed);
  };


  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
    const refreshed = await getGroupTasks(groupId!);
    setTasks(refreshed);
  };


  useEffect(() => {
    if (!groupId) return;
    setLoading(true);
    getGroupTasks(groupId)
      .then((t) => setTasks(t))
      .catch((e: any) => setError(e?.message ?? "Request failed"))
      .finally(() => setLoading(false));
  }, [groupId, getGroupTasks]);

  const formatDueDate = (value: string | null | undefined) => {
    if (!value) return null;
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(d);
  };

  const filteredTasks = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return tasks.filter(t => {
      if (q) {
        const title = (t.title ?? "").toLowerCase();
        if (!title.includes(q)) return false;
      }
      if (quickFilter === "high" && t.priority !== "HIGH") return false;
      if (quickFilter === "overdue") {
        if (!t.deadline && !t.dueDate) return false;
        const due = new Date(t.deadline ?? t.dueDate);
        return due < new Date();
      }
      if (quickFilter === "today") {
        if (!t.deadline && !t.dueDate) return false;
        const due = new Date(t.deadline ?? t.dueDate);
        const now = new Date();
        return due.toDateString() === now.toDateString();
      }
      return true;
    });
  }, [tasks, searchTerm, quickFilter]);

  useEffect(() => {
    if (!groupId) return;
    // Ensure groups are loaded
    fetchGroups();
  }, [groupId, fetchGroups]);

  return (
    <div className="grid gap-5">
      {groupsLoading && <div className="text-sm text-[var(--color-muted)]">Loading groups…</div>}
      {groupsError && <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{groupsError}</div>}
      {group && (
        <div className="card">
          <h2 className="text-xl font-semibold"><span>{group.name}</span><button className="ml-2 text-sm btn--secondary" onClick={() => setIsMembersOpen(true)}>Members</button><button className="ml-2 text-sm btn--secondary" onClick={() => setIsAddTaskOpen(true)}>Add Task</button></h2>
        </div>
      )}

      {loading && <div className="text-sm text-[var(--color-muted)]">Loading…</div>}
      {error && <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

      {!loading && filteredTasks.length === 0 && (
        <div className="card">
          No tasks in this group yet.
        </div>
      )}

      {/* Search and filter UI */}
      <div className="card flex flex-col h-full justify-between">
        <div className="search-filter-bar mt-auto">
          <input
            className="search-input"
            placeholder="Search tasks…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select
            className="filter-select"
            value={quickFilter}
            onChange={e => setQuickFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="high">High priority</option>
            <option value="overdue">Overdue</option>
            <option value="today">Due today</option>
          </select>
        </div>
      </div>

      <div className="grid gap-3">
        {filteredTasks.map((t) => (
          <div key={t.id} className="card">
            <div className="">
              <div className="">{t.title}</div>
              <div className="">{t.status.replace("_", " ")}</div>
                            </div>
            {t.description && (
              <div className="mt-2 text-sm text-[var(--color-muted)]">{t.description}</div>
            )}
            {(t.deadline ?? t.dueDate) && (
              <div className="mt-2 text-xs text-muted">
                📅 Due <time dateTime={t.deadline ?? t.dueDate}>{formatDueDate(t.deadline ?? t.dueDate) ?? new Date(t.deadline ?? t.dueDate).toLocaleString()}</time>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dashboard */}
      <GroupDashboard tasks={tasks} />
      <GroupMembersModal isOpen={isMembersOpen} onClose={() => setIsMembersOpen(false)} groupId={groupId!} />
      <TaskModal
          isOpen={isAddTaskOpen}
          onClose={() => {
            setIsAddTaskOpen(false);
            setEditingTask(null);
          }}
          task={editingTask ?? undefined}
          onCreate={handleCreateTask}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />


    </div>
  );
}
