import { useState, useEffect } from "react";
import { Button } from "./Button";
import { PRIORITY_LABELS, STATUS_LABELS } from "../utils/labels";

import type { Task, TaskPriority, TaskStatus } from "../hooks/useTasks";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task;
  initialStatus?: TaskStatus;
  onCreate: (input: { title: string; status: TaskStatus; description?: string; notes?: string; deadline?: string }) => unknown;
  onUpdate: (id: string, input: Partial<Pick<Task, "status" | "priority" | "description" | "notes" | "deadline">>) => unknown;
  onDelete: (id: string) => unknown;
  error?: string;
}

export function TaskModal({
  isOpen,
  onClose,
  task,
  initialStatus = "TODO",
  onCreate,
  onUpdate,
  onDelete,
  error,
}: TaskModalProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? initialStatus);
  const [description, setDescription] = useState(task?.description ?? "");
  const [deadline, setDeadline] = useState(task?.deadline ?? "");
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? "MEDIUM");

  useEffect(() => {
    setTitle(task?.title ?? "");
    setStatus(task?.status ?? initialStatus);
    setPriority(task?.priority ?? "MEDIUM");
    setDescription(task?.description ?? "");
    setDeadline(task?.deadline ?? "");
  }, [task, initialStatus]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!title.trim()) return;
    if (task) {
      onUpdate(task.id, {
        status,
        priority,
        description: description.trim() || undefined,
        deadline: deadline || undefined,
        ...(deadline ? { dueDate: deadline } : {}),
      });
    } else {
      onCreate({
        title: title.trim(),
        status,
        description: description.trim() || undefined,
        deadline: deadline || undefined,
        ...(deadline ? { dueDate: deadline } : {}),
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (task) {
      onDelete(task.id);
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <div className="modal__title">
            <h2>{task ? "Редагувати задачу" : "Створити задачу"}</h2>
            <p className="modal__subtitle">
              {task
                ? "Оновіть статус, пріоритет, опис або дедлайн."
                : "Додайте назву та налаштуйте пріоритет перед збереженням."}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Закрити
          </Button>
        </div>

        <div className="modal__body">
          <div className="form-group">
            <label className="form-label" htmlFor="task-title">
              Назва
            </label>
            <input
              id="task-title"
              className="form-input"
              placeholder="Наприклад: Підготувати звіт"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!!task}
            />
          </div>

          <div className="form-grid form-grid--2col">
            <div className="form-group">
              <label className="form-label" htmlFor="task-status">
                Статус
              </label>
              <select
                id="task-status"
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                <option value="TODO">{STATUS_LABELS.TODO}</option>
                <option value="IN_PROGRESS">{STATUS_LABELS.IN_PROGRESS}</option>
                <option value="DONE">{STATUS_LABELS.DONE}</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-priority">
                Пріоритет
              </label>
              <select
                id="task-priority"
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                <option value="LOW">{PRIORITY_LABELS.LOW}</option>
                <option value="MEDIUM">{PRIORITY_LABELS.MEDIUM}</option>
                <option value="HIGH">{PRIORITY_LABELS.HIGH}</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-description">
              Опис
            </label>
            <textarea
              id="task-description"
              className="form-input"
              rows={3}
              placeholder="Необов'язковий опис"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-deadline">
              Дедлайн
            </label>
            <input
              id="task-deadline"
              type="datetime-local"
              className="form-input"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          {error && <div className="alert alert--error">{error}</div>}
        </div>

        <div className="modal__footer">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Скасувати
          </Button>
          {task ? (
            <>
              <Button variant="danger" size="sm" onClick={handleDelete}>
                Видалити
              </Button>
              <Button variant="primary" size="sm" onClick={handleSubmit}>
                Зберегти
              </Button>
            </>
          ) : (
            <Button variant="primary" size="sm" onClick={handleSubmit} disabled={!title.trim()}>
              Створити
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
