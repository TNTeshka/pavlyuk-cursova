import { useEffect, useState } from "react";
import { api } from "../api";
import { useTaskStore, Task } from "../store/taskStore";
import { Button } from "../components/Button";

export function Dashboard() {
  const tasks = Object.values(useTaskStore(state => state.tasks));
  const setAll = useTaskStore(state => state.setAll);
  const [showPriority, setShowPriority] = useState(false);

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

  // --- Status counts ---
  const byStatus: Record<"TODO" | "IN_PROGRESS" | "DONE", number> = {
    TODO: 0,
    IN_PROGRESS: 0,
    DONE: 0,
  };
  // --- Priority counts ---
  const byPriority: Record<"LOW" | "MEDIUM" | "HIGH", number> = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
  };

  tasks.forEach((t) => {
    // status aggregation
    byStatus[t.status] = (byStatus[t.status] ?? 0) + 1;
    // priority aggregation
    // @ts-ignore – task type does not currently include priority in the definition; adjust if needed
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

  return (
    <div className="dashboard-page">
      <section className="card">
        <div className="card-header">
  <h1 className="card-title">Dashboard</h1>
  <Button variant="primary" size="sm" onClick={() => setShowPriority(!showPriority)}>
    {showPriority ? "Show Status" : "Show Priority"}
  </Button>
</div>
<div className="stat-item">
  <div className="stat-label">Completion</div>
  <div className="stat-value">{completionRate}%</div>
</div>
        {showPriority ? (
          // Priority view
          <>
            <div className="progress-section">
              <div className="progress-row">
                <span className="progress-label">High</span>
                <span>{byPriority.HIGH}</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar high" style={{ width: `${highRate}%` }} />
              </div>

              <div className="progress-row">
                <span className="progress-label">Medium</span>
                <span>{byPriority.MEDIUM}</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar medium" style={{ width: `${mediumRate}%` }} />
              </div>

              <div className="progress-row">
                <span className="progress-label">Low</span>
                <span>{byPriority.LOW}</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar low" style={{ width: `${lowRate}%` }} />
              </div>
            </div>
          </>
        ) : (
          // Status view (existing)
          <>
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
          </>
        )}
      </section>
    </div>
  );
}

