import { useEffect, useState } from "react";
import { api } from "../api";
import { useTaskStore, Task } from "../store/taskStore";
import { Button } from "../components/Button";
import { PRIORITY_LABELS, STATUS_LABELS } from "../utils/labels";

export function Dashboard() {
  const tasks = Object.values(useTaskStore((state) => state.tasks));
  const setAll = useTaskStore((state) => state.setAll);
  const [showPriority, setShowPriority] = useState(false);

  useEffect(() => {
    if (tasks.length === 0) {
      (async () => {
        try {
          const { tasks: fetched } = await api<{ tasks: Task[] }>("/api/tasks");
          setAll(fetched);
        } catch (e) {
          console.error(e);
        }
      })();
    }
  }, [tasks.length, setAll]);

  const byStatus: Record<"TODO" | "IN_PROGRESS" | "DONE", number> = {
    TODO: 0,
    IN_PROGRESS: 0,
    DONE: 0,
  };
  const byPriority: Record<"LOW" | "MEDIUM" | "HIGH", number> = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
  };

  tasks.forEach((t) => {
    byStatus[t.status] = (byStatus[t.status] ?? 0) + 1;
    if ((t as any).priority) {
      const p = (t as any).priority as "LOW" | "MEDIUM" | "HIGH";
      byPriority[p] = (byPriority[p] ?? 0) + 1;
    }
  });

  const total = byStatus.TODO + byStatus.IN_PROGRESS + byStatus.DONE;
  const totalPriority = byPriority.LOW + byPriority.MEDIUM + byPriority.HIGH;

  const completionRate = total ? Math.round((byStatus.DONE / total) * 100) : 0;
  const inProgressRate = total ? Math.round((byStatus.IN_PROGRESS / total) * 100) : 0;
  const todoRate = total ? Math.round((byStatus.TODO / total) * 100) : 0;

  const highRate = totalPriority ? Math.round((byPriority.HIGH / totalPriority) * 100) : 0;
  const mediumRate = totalPriority ? Math.round((byPriority.MEDIUM / totalPriority) * 100) : 0;
  const lowRate = totalPriority ? Math.round((byPriority.LOW / totalPriority) * 100) : 0;

  const renderBar = (
    label: string,
    count: number,
    rate: number,
    fillClass: string
  ) => (
    <div className="stats-bar" key={label}>
      <div className="stats-bar__label">
        <span>{label}</span>
        <span>{count}</span>
      </div>
      <div className="stats-bar__track">
        <div className={`stats-bar__fill ${fillClass}`} style={{ width: `${rate}%` }} />
      </div>
    </div>
  );

  return (
    <div className="dashboard-page">
      <section className="dashboard-card">
        <div className="dashboard-card__header">
          <div className="dashboard-card__title-block">
            <h2 className="dashboard-card__title">Панель</h2>
            <p className="dashboard-card__subtitle">
              {showPriority ? "Розподіл задач за пріоритетом" : "Прогрес задач за статусом"}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setShowPriority(!showPriority)}>
            {showPriority ? "Показати статуси" : "Показати пріоритети"}
          </Button>
        </div>

        <div className="dashboard-highlight">
          <span className="dashboard-highlight__label">Завершено</span>
          <span className="dashboard-highlight__value">{completionRate}%</span>
        </div>

        <div className="stats-widget__bars">
          {showPriority ? (
            <>
              {renderBar(PRIORITY_LABELS.HIGH, byPriority.HIGH, highRate, "stats-bar__fill--high")}
              {renderBar(PRIORITY_LABELS.MEDIUM, byPriority.MEDIUM, mediumRate, "stats-bar__fill--medium")}
              {renderBar(PRIORITY_LABELS.LOW, byPriority.LOW, lowRate, "stats-bar__fill--low")}
            </>
          ) : (
            <>
              {renderBar(STATUS_LABELS.DONE, byStatus.DONE, completionRate, "stats-bar__fill--done")}
              {renderBar(STATUS_LABELS.IN_PROGRESS, byStatus.IN_PROGRESS, inProgressRate, "stats-bar__fill--in_progress")}
              {renderBar(STATUS_LABELS.TODO, byStatus.TODO, todoRate, "stats-bar__fill--todo")}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
