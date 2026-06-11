import { useState } from "react";
import { Button } from "../components/Button";

import type { Task } from "../hooks/useTasks";

interface TaskDetailsProps {
  task: Task;
  onClose: () => void;
}

export function TaskDetails({ task, onClose }: TaskDetailsProps) {
  const [show, setShow] = useState(true);

  if (!show) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2>{task.title}</h2>
        {task.description && <p>{task.description}</p>}
        {task.dueDate && <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
        <Button onClick={() => setShow(false)}>Close</Button>
      </div>
    </div>
  );
}
