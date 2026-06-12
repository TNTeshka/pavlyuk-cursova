import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGroups } from "../hooks/useGroups";
import { api } from "../api";

import { Button } from "../components/Button";
import styles from "./GroupTasks.module.css";
import { TaskModal } from "../components/TaskModal";
import { GroupSettingsModal } from "../components/GroupSettingsModal";
import { GroupMembersModal } from "../components/GroupMembersModal";
import { KanbanBoard } from "../components/KanbanBoard";

import { Task } from "../hooks/useTasks"; // reuse Task type

// Group statistics widget (replaces placeholder)
function GroupStatsWidget({ tasks }: { tasks: Task[] }) {
  const byStatus: Record<'TODO' | 'IN_PROGRESS' | 'DONE', number> = {
    TODO: 0,
    IN_PROGRESS: 0,
    DONE: 0,
  };
  tasks.forEach((t) => {
    byStatus[t.status] = (byStatus[t.status] ?? 0) + 1;
  });
  const total = byStatus.TODO + byStatus.IN_PROGRESS + byStatus.DONE;
  const completion = total ? Math.round((byStatus.DONE / total) * 100) : 0;
  const inProgress = total ? Math.round((byStatus.IN_PROGRESS / total) * 100) : 0;
  const todo = total ? Math.round((byStatus.TODO / total) * 100) : 0;

  return (
    <div className="dashboard-card">
      <div className="dashboard-card__header">
        <div className="dashboard-card__title-block">
          <h2 className="dashboard-card__title">Панель групи</h2>
          <p className="dashboard-card__subtitle">Огляд статусу задач у цій групі.</p>
        </div>
      </div>
      <div className="dashboard-highlight">
        <span className="dashboard-highlight__label">Завершено</span>
        <span className="dashboard-highlight__value">{completion}%</span>
      </div>
      <div className="stats-widget__bars">
        <div className="stats-bar">
          <div className="stats-bar__label">
            <span>Виконано</span>
            <span>{byStatus.DONE}</span>
          </div>
          <div className="stats-bar__track">
            <div className="stats-bar__fill stats-bar__fill--done" style={{ width: `${completion}%` }} />
          </div>
        </div>
        <div className="stats-bar">
          <div className="stats-bar__label">
            <span>В процесі</span>
            <span>{byStatus.IN_PROGRESS}</span>
          </div>
          <div className="stats-bar__track">
            <div className="stats-bar__fill stats-bar__fill--in_progress" style={{ width: `${inProgress}%` }} />
          </div>
        </div>
        <div className="stats-bar">
          <div className="stats-bar__label">
            <span>До виконання</span>
            <span>{byStatus.TODO}</span>
          </div>
          <div className="stats-bar__track">
            <div className="stats-bar__fill stats-bar__fill--todo" style={{ width: `${todo}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Minimal placeholder StatsWidget (mirroring main page’s empty widget)
function StatsWidget({ stats, loading, error }: { stats: any; loading: boolean; error: string | null }) {
  // Placeholder – can be expanded later
  return null;
}

export function GroupTasks() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();

  const { groups, loading: groupsLoading, error: groupsError, fetchGroups, getGroupTasks } = useGroups();

  const safeGroups = groups ?? [];
  const group = safeGroups.find(g => g.id === groupId);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // ---------- Handlers ----------
  const handleCreateTask = async (input: { title: string; status: string; description?: string; notes?: string; deadline?: string }) => {
    if (!groupId) return;
    // Provide default priority to satisfy API schema (optional)
    const payload = { ...input, priority: "MEDIUM" as const };
    try {
      await api(`/api/groups/${groupId}/tasks`, { method: "POST", body: JSON.stringify(payload) });
      const refreshed = await getGroupTasks(groupId);
      setTasks(refreshed);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "Не вдалося створити задачу");
    }
  };

  const handleUpdateTask = async (id: string, input: Partial<Pick<Task, 'status' | 'priority' | 'description' | 'notes' | 'deadline'>>) => {
    const { deadline, ...rest } = input as any;
    const payload: any = { ...rest };
    if (deadline) payload.dueDate = deadline;
    await api(`/api/groups/${groupId}/tasks/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
    const refreshed = await getGroupTasks(groupId!);
    setTasks(refreshed);
  };

  const handleDeleteTask = async (id: string) => {
    await api(`/api/groups/${groupId}/tasks/${id}`, { method: "DELETE" });
    const refreshed = await getGroupTasks(groupId!);
    setTasks(refreshed);
  };

  // ---------- Effects ----------
  // Load group tasks when groupId changes
  useEffect(() => {
    if (!groupId) return;
    setLoading(true);
    getGroupTasks(groupId)
      .then(setTasks)
      .catch((e: any) => setError(e?.message ?? "Не вдалося виконати запит"))
      .finally(() => setLoading(false));
  }, [groupId, getGroupTasks]);

  // Ensure groups are loaded – needed for the header
  useEffect(() => {
    if (!groupId) return;
    fetchGroups();
  }, [groupId, fetchGroups]);

  // ---------- UI helpers ----------
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

  // ---------- Render ----------
  return (
    <>

      <div className="tasks-container">
        <div className="tasks-page">
          {/* Group picture with name and members button */}
          <div className={styles.groupSection}>
            <div className={styles.groupSection__wrapper}>
              <h1 className={styles.groupSection__title}>{group?.name ?? "Завантаження…"}</h1>
              {group?.description && (
                <p className={styles.groupSection__subtitle}>{group.description}</p>
              )}
              <div className={styles.groupSection__actions}>
                <Button variant="secondary" size="sm" onClick={() => setIsMembersOpen(true)}>
                  Учасники
                </Button>
                {group?.ownerId && localStorage.getItem("userId") === group.ownerId && (
                  <Button variant="secondary" size="sm" onClick={() => setIsSettingsOpen(true)}>
                    Налаштування групи
                  </Button>
                )}
              </div>
            </div>
          </div>
          <KanbanBoard
            tasks={tasks}
            loading={loading}
            error={error}
            onCreate={handleCreateTask}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
            onSelect={(task) => {
              setEditingTask(task);
              setIsAddTaskOpen(true);
            }}
            onNewTask={() => setIsAddTaskOpen(true)}
          />
          <section id="dashboard" className="dashboard-section">
            <GroupStatsWidget tasks={tasks} />
          </section>

          {/* Modals */}
          <TaskModal
            isOpen={isAddTaskOpen && !editingTask}
            onClose={() => {
              setIsAddTaskOpen(false);
              setEditingTask(null);
            }}
            task={undefined}
            onCreate={handleCreateTask}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
          />
          {editingTask && (
            <TaskModal
              isOpen={!!editingTask}
              onClose={() => {
                setEditingTask(null);
                setIsAddTaskOpen(false);
              }}
              task={editingTask}
              onCreate={handleCreateTask}
              onUpdate={handleUpdateTask}
              onDelete={handleDeleteTask}
            />
          )}
          <GroupMembersModal
            isOpen={isMembersOpen}
            onClose={() => setIsMembersOpen(false)}
            groupId={groupId!}
            onLeftGroup={() => navigate("/groups")}
            onGroupUpdated={() => fetchGroups()}
          />
          <GroupSettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            groupId={groupId!}
            groupName={group?.name ?? ""}
            groupDescription={group?.description}
            onUpdated={() => {
              fetchGroups();
            }}
          />
        </div>
      </div>
    </>
  );
}
