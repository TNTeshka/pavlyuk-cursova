import React from "react";

type Props = {
  // overall completion percentage (0-100)
  completion?: number;
  // individual status percentages (sum can be <= 100)
  done?: number;
  inProgress?: number;
  toDo?: number;
};

export const ProjectCompletionWidget: React.FC<Props> = ({
  completion = 20,
  done = 20,
  inProgress = 30,
  toDo = 50,
}) => {
  // ensure we don't overflow 100%
  const safe = (v: number) => Math.max(0, Math.min(v, 100));
  return (
    <div className="project-completion-widget">
      <div className="title">Project Completion</div>
      <div className="percentage">{safe(completion)}%</div>

      <div className="bar-label">Done</div>
      <div className="progress-track">
        <div className="progress-done" style={{ width: `${safe(done)}%` }} />
      </div>

      <div className="bar-label">In Progress</div>
      <div className="progress-track">
        <div className="progress-in-progress" style={{ width: `${safe(inProgress)}%` }} />
      </div>

      <div className="bar-label">To Do</div>
      <div className="progress-track">
        <div className="progress-todo" style={{ width: `${safe(toDo)}%` }} />
      </div>
    </div>
  );
};
