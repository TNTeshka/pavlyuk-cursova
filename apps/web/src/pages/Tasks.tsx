import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Dashboard } from "./Dashboard";
import { useTasks, type Task, type TaskStatus } from "../hooks/useTasks";
import { KanbanBoard } from "../components/KanbanBoard";
import { TaskModal } from "../components/TaskModal";

const STATUSES: readonly TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"] as const;

function StatsWidget({
  stats,
  loading,
  error
}: {
  stats: { byStatus: Record<TaskStatus, number> } | null;
  loading: boolean;
  error: string | null;
}) {
  const byStatus = stats?.byStatus ?? { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
  const total = byStatus.TODO + byStatus.IN_PROGRESS + byStatus.DONE;
  const donePct = total ? Math.round((byStatus.DONE / total) * 100) : 0;

  const bar = (value: number) => (total ? Math.round((value / total) * 100) : 0);
}

export function Tasks() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [initialStatusForCreate, setInitialStatusForCreate] = useState<TaskStatus>('TODO');

  const location = useLocation();
  useEffect(() => {
    const hash = location.hash || window.location.hash;
    if (hash === "#dashboard") {
      const el = document.getElementById("dashboard");
      el?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  const { tasks, stats, loading, error, statsLoading, statsError, createTask, updateTask, deleteTask } = useTasks();

  const handleNewTask = () => {
    setInitialStatusForCreate('TODO');
    setSelectedTask(null);
    setIsModalOpen(true);
    setModalError(null);
  };

  return (
    <div className="tasks-container">
      <div className="tasks-page">
        <StatsWidget stats={stats} loading={statsLoading} error={statsError} />
        <KanbanBoard
          tasks={tasks}
          loading={loading}
          error={error}
          onCreate={createTask}
          onUpdate={(id, patch) => updateTask(id, patch)}
          onDelete={deleteTask}
          onSelect={(task) => {
            setSelectedTask(task);
            setIsModalOpen(true);
            setModalError(null);
          }}
          onNewTask={handleNewTask}
        />
        <section id="dashboard" className="dashboard-section">
          <Dashboard />
        </section>
        {isModalOpen && (
          <TaskModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            task={selectedTask ?? undefined}
            initialStatus={initialStatusForCreate}
            onCreate={createTask}
            onUpdate={updateTask}
            onDelete={deleteTask}
            error={modalError ?? undefined}
          />
        )}
      </div>
    </div>
  );
}
