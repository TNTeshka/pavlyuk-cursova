import { useMemo, useState } from "react";
import type { Task, TaskPriority, TaskStatus } from "../hooks/useTasks";

import { Button } from "../components/Button";

interface KanbanBoardProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onCreate: (input: { title: string; status: TaskStatus }) => unknown;
  onUpdate: (
    id: string,
    input: Partial<Pick<Task, "status" | "priority">>,
    prev: Task,
    next: Task
  ) => unknown;
  onDelete: (id: string) => unknown;
  onSelect?: (task: Task) => void;
  onNewTask?: () => void;
}

export function KanbanBoard({
  tasks,
  loading,
  error,
  onCreate,
  onUpdate,
  onDelete,
  onSelect,
  onNewTask,
}: KanbanBoardProps) {
  const STATUSES: readonly TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"] as const;

  const [drafts, setDrafts] = useState<Record<TaskStatus, string>>({
    TODO: "",
    IN_PROGRESS: "",
    DONE: "",
  });

  const [busyStatus, setBusyStatus] = useState<Record<TaskStatus, boolean>>({
    TODO: false,
    IN_PROGRESS: false,
    DONE: false,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [quickFilter, setQuickFilter] = useState(""); // "", "high", "overdue", "today"

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
      hour12: false,
    }).format(d);
  };

  const filteredTasks = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return tasks.filter((t) => {
      if (q) {
        const title = (t.title ?? "").toLowerCase();
        const matchesSearch = title.indexOf(q) !== -1;
        if (!matchesSearch) return false;
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

      if (quickFilter === "nodate") {
        if (t.deadline || t.dueDate) return false;
      }

      return true;
    });
  }, [tasks, searchTerm, quickFilter]);

  const grouped = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { TODO: [], IN_PROGRESS: [], DONE: [] };
    for (const t of filteredTasks) map[t.status].push(t);
    for (const s of STATUSES) map[s].sort((a, b) => a.title.localeCompare(b.title));
    return map;
  }, [filteredTasks, STATUSES]);

  const run = (fn: () => unknown, onDone?: () => void) => {
    try {
      const r: any = fn();
      if (r && typeof r.then === "function") {
        r.then(() => onDone?.()).catch(() => {}).finally?.(() => {});
      } else {
        onDone?.();
      }
    } catch {
      // ignore
    }
  };

  const applyUpdate = (id: string, patch: Partial<Pick<Task, "status" | "priority">>) => {
    const prev = tasks.find((x) => x.id === id);
    if (!prev) return;
    const next: Task = { ...prev, ...patch };
    run(() => onUpdate(id, patch, prev, next));
  };

  // Helper functions for CSS class mapping
  const columnBadgeClass = (status: TaskStatus) => {
    switch (status) {
      case "TODO": return "column-badge-todo";
      case "IN_PROGRESS": return "column-badge-in-progress";
      case "DONE": return "column-badge-done";
      default: return "";
    }
  };
  const statusPillClass = (status: TaskStatus) => {
    switch (status) {
      case "TODO": return "pill-todo";
      case "IN_PROGRESS": return "pill-in-progress";
      case "DONE": return "pill-done";
      default: return "";
    }
  };
  const priorityBadgeClass = (priority: TaskPriority) => {
    switch (priority) {
      case "LOW": return "badge-low";
      case "MEDIUM": return "badge-medium";
      case "HIGH": return "badge-high";
      default: return "";
    }
  };

  return (
    <div className="mt-6">
      {error && <div className="mb-3 rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}
      {loading && <div className="text-[var(--color-muted)] mt-3 text-sm">Loading…</div>}

      {/* Full‑width background bar for tasks filter */}
      <div className="search-filter-bar">
        <div>
          <div className="tasks-header__content">
            <h2 className="">Here you can filter or</h2>
          </div>
          <div className="tasks-header__actions">
            <Button onClick={onNewTask}>create a task</Button>
          </div>
        </div>
        <input
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search tasks…"
        />
        <select
          className="filter-select"
          value={quickFilter}
          onChange={(e) => setQuickFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="high">High priority</option>
          <option value="overdue">Overdue</option>
          <option value="nodate">Без дати</option>
          <option value="today">Due today</option>
        </select>
      </div>

      {grouped && (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {STATUSES.map((status) => (
            <div key={status} className="card">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold uppercase">{status.replace("_", " ")}</h3>
                <span className={`column-badge ${columnBadgeClass(status)}`}>{grouped[status].length}</span>
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  className="form-input"
                  value={drafts[status]}
                  placeholder="Quick add…"
                  onChange={(e) => setDrafts((d) => ({ ...d, [status]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    const title = drafts[status].trim();
                    if (!title || busyStatus[status]) return;

                    setBusyStatus((b) => ({ ...b, [status]: true }));
                    run(
                      () => onCreate({ title, status }),
                      () => {
                        setDrafts((d) => ({ ...d, [status]: "" }));
                        setBusyStatus((b) => ({ ...b, [status]: false }));
                      }
                    );
                  }}
                  disabled={loading || busyStatus[status]}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const title = drafts[status].trim();
                    if (!title || busyStatus[status]) return;

                    setBusyStatus((b) => ({ ...b, [status]: true }));
                    run(
                      () => onCreate({ title, status }),
                      () => {
                        setDrafts((d) => ({ ...d, [status]: "" }));
                        setBusyStatus((b) => ({ ...b, [status]: false }));
                      }
                    );
                  }}
                  disabled={loading || busyStatus[status] || drafts[status].trim().length === 0}
                >
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    console.log('Extra button clicked');
                  }}
                >
                  Extra
                </Button>
              </div>

              <div className="mt-4 grid gap-3">
                {grouped[status].map((t) => {
                  const due = formatDueDate(t.deadline ?? t.dueDate);
                  const overdue = (t.deadline ?? t.dueDate) ? new Date(t.deadline ?? t.dueDate) < new Date() && t.status !== "DONE" : false;
                  return (
                    <div key={t.id} className="task-card group">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={() => onSelect?.(t)}
                          className="h-auto w-full justify-start p-0 text-left font-normal hover:bg-transparent cursor-pointer"
                        >
                          <div className="truncate text-sm font-semibold tracking-tight text-text group-hover:text-white">
                            {t.title}
                          </div>
                          <div className="flex gap-2 items-center mt-1">
                            <span className={`pill ${statusPillClass(t.status)} status-pill-${t.status.toLowerCase()}`}>{t.status.replace("_", " ")}</span>
                            <span className={`pill ${priorityBadgeClass(t.priority)}`}>{t.priority}</span>
                          </div>
                          {t.description && (
                            <div className="mt-1 line-clamp-2 text-sm text-muted">
                              {t.description}
                            </div>
                          )}
                          {(t.deadline ?? t.dueDate) && (
                            <div className={`mt-2 text-xs ${overdue ? "text-rose-200" : "text-muted"}`}>
                              📅 Due <time dateTime={t.deadline ?? t.dueDate}>{formatDueDate(t.deadline ?? t.dueDate) ?? new Date(t.deadline ?? t.dueDate).toLocaleString()}</time>
                            </div>
                          )}
                        </Button>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <label className="text-muted text-xs mr-1" htmlFor={`status-${t.id}`}>Статус:</label>
                            <select
                              className="status-select hidden"
                              value={t.status}
                              onChange={(e) => applyUpdate(t.id, { status: e.target.value as TaskStatus })}
                              id={`status-${t.id}`}
                            >
                              <option value="TODO">TODO</option>
                              <option value="IN_PROGRESS">IN_PROGRESS</option>
                              <option value="DONE">DONE</option>
                            </select>
                            <label className="text-muted text-xs mr-1" htmlFor={`priority-${t.id}`}>Пріоритет:</label>
                            <select
                              className="priority-select hidden"
                              value={t.priority}
                              onChange={(e) => applyUpdate(t.id, { priority: e.target.value as TaskPriority })}
                              id={`priority-${t.id}`}
                            >
                              <option value="LOW">LOW</option>
                              <option value="MEDIUM">MEDIUM</option>
                              <option value="HIGH">HIGH</option>
                            </select>
                            <div className="task-actions flex justify-end gap-2 mt-2">
                              <button className="icon-button" aria-label="Delete" onClick={() => run(() => onDelete(t.id))}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
