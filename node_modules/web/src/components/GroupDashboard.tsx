import { Task } from "../store/taskStore";
import { STATUS_LABELS } from "../utils/labels";

export function GroupDashboard({ tasks }: { tasks: Task[] }) {
  const byStatus: Record<"TODO" | "IN_PROGRESS" | "DONE", number> = {
    TODO: 0,
    IN_PROGRESS: 0,
    DONE: 0,
  };
  tasks.forEach((t) => {
    byStatus[t.status] = (byStatus[t.status] ?? 0) + 1;
  });

  const total = byStatus.TODO + byStatus.IN_PROGRESS + byStatus.DONE;
  const completionRate = total ? Math.round((byStatus.DONE / total) * 100) : 0;
  const inProgressRate = total ? Math.round((byStatus.IN_PROGRESS / total) * 100) : 0;
  const todoRate = total ? Math.round((byStatus.TODO / total) * 100) : 0;

  return (
    <div className="dashboard-page">
      <section className="dashboard-card">
        <div className="dashboard-card__header">
          <div className="dashboard-card__title-block">
            <h2 className="dashboard-card__title">Панель групи</h2>
            <p className="dashboard-card__subtitle">Огляд задач у цій групі.</p>
          </div>
        </div>
        <div className="dashboard-highlight">
          <span className="dashboard-highlight__label">Завершено</span>
          <span className="dashboard-highlight__value">{completionRate}%</span>
        </div>
        <div className="stats-widget__bars">
          <div className="stats-bar">
            <div className="stats-bar__label">
              <span>{STATUS_LABELS.DONE}</span>
              <span>{byStatus.DONE}</span>
            </div>
            <div className="stats-bar__track">
              <div className="stats-bar__fill stats-bar__fill--done" style={{ width: `${completionRate}%` }} />
            </div>
          </div>
          <div className="stats-bar">
            <div className="stats-bar__label">
              <span>{STATUS_LABELS.IN_PROGRESS}</span>
              <span>{byStatus.IN_PROGRESS}</span>
            </div>
            <div className="stats-bar__track">
              <div className="stats-bar__fill stats-bar__fill--in_progress" style={{ width: `${inProgressRate}%` }} />
            </div>
          </div>
          <div className="stats-bar">
            <div className="stats-bar__label">
              <span>{STATUS_LABELS.TODO}</span>
              <span>{byStatus.TODO}</span>
            </div>
            <div className="stats-bar__track">
              <div className="stats-bar__fill stats-bar__fill--todo" style={{ width: `${todoRate}%` }} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
