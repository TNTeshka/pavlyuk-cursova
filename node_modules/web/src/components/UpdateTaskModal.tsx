import { useState } from "react";
import { Button } from "../components/Button";

import type { Task, TaskPriority, TaskStatus } from "../hooks/useTasks";

interface UpdateTaskModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (id: string, input: Partial<Pick<Task, \"status\" | \"priority\" | \"title\" | \"description\">) => unknown;
}

export function UpdateTaskModal({ task, onClose, onUpdate }: UpdateTaskModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);

  const handleSave = () => {
    onUpdate(task.id, { title, description, status, priority });
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h3>Оновити задачу</h3>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Назва" />
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Опис" />
        <select value={status} onChange={e => setStatus(e.target.value as TaskStatus)}>
          <option value="TODO">До виконання</option>
          <option value="IN_PROGRESS">В процесі</option>
          <option value="DONE">Виконано</option>
        </select>
        <select value={priority} onChange={e => setPriority(e.target.value as TaskPriority)}>
          <option value="LOW">Низький</option>
          <option value="MEDIUM">Середній</option>
          <option value="HIGH">Високий</option>
        </select>
        <Button onClick={handleSave}>Зберегти</Button>
        <Button onClick={onClose}>Скасувати</Button>
      </div>
    </div>
  );
}
