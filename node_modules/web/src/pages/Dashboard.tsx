import { useEffect } from "react";
import { api } from "../api";
import { useTaskStore, Task } from "../store/taskStore";

export function Dashboard() {
  const tasks = Object.values(useTaskStore(state => state.tasks));
  const setAll = useTaskStore(state => state.setAll);

  // Load tasks once if store is empty
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
    DONE: 0
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
      <section className="card">
        <div className="card-header">
          <h1 className="card-title">Dashboard</h1>
          <p className="card-subtitle">Your calm weekly pulse and delivery momentum.</p>
        </div>
        <div className="stat-item">
          <div className="stat-label">Completion</div>
          <div className="stat-value">{completionRate}%</div>
        </div>
        {/* You can add loading/error handling as needed */}
        <div className="progress-section">
          <div className="progress-row">
            <span className="progress-label">Done</span>
            <span>{byStatus.DONE}</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar done" style={{ width: `${completionRate}%` }} />
          </div>

          <div className="progress-row">
            <span className="progress-label">In Progress</span>
            <span>{byStatus.IN_PROGRESS}</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar in-progress" style={{ width: `${inProgressRate}%` }} />
          </div>

          <div className="progress-row">
            <span className="progress-label">To Do</span>
            <span>{byStatus.TODO}</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar todo" style={{ width: `${todoRate}%` }} />
          </div>
        </div>
      </section>
    </div>
  );
}

