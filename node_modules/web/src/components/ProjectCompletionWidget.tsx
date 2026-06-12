import React from "react";
import { STATUS_LABELS } from "../utils/labels";

type Props = {
  completion?: number;
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
  const safe = (v: number) => Math.max(0, Math.min(v, 100));
  return (
    <div className="project-completion-widget">
      <div className="title">Завершення проєкту</div>
      <div className="percentage">{safe(completion)}%</div>

      <div className="bar-label">{STATUS_LABELS.DONE}</div>
      <div className="progress-track">
        <div className="progress-done" style={{ width: `${safe(done)}%` }} />
      </div>

      <div className="bar-label">{STATUS_LABELS.IN_PROGRESS}</div>
      <div className="progress-track">
        <div className="progress-in-progress" style={{ width: `${safe(inProgress)}%` }} />
      </div>

      <div className="bar-label">{STATUS_LABELS.TODO}</div>
      <div className="progress-track">
        <div className="progress-todo" style={{ width: `${safe(toDo)}%` }} />
      </div>
    </div>
  );
};
