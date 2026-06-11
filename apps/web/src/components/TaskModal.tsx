import { useState, useEffect } from "react";
import { Button } from "./Button";

import type { Task, TaskPriority, TaskStatus } from "../hooks/useTasks";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task; // if undefined, creating new task
  initialStatus?: TaskStatus; // used when creating
  onCreate: (input: { title: string; status: TaskStatus; description?: string; notes?: string; deadline?: string }) => unknown;
  onUpdate: (id: string, input: Partial<Pick<Task, 'status' | 'priority' | 'description' | 'notes' | 'deadline'>>) => unknown;
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

  // sync when task changes (e.g., selecting another task)
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
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="">
          <div>
            <div className="text-base font-semibold tracking-tight">{task ? "Edit task" : "Create task"}</div>
            <div className="muted mt-1 text-sm">
              {task ? "Update status, priority, description, notes or deadline." : "Give it a name. You can tune priority after creation."}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
          </div>

          <div className="mt-5 grid gap-4">
            {/* Title */}
            <div>
              <div className="muted mb-2 text-xs font-semibold uppercase tracking-wide">Title</div>
              <input
                className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-text placeholder:text-muted-2 focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-70"
                placeholder="e.g. Prepare weekly report"
                value={title}
                onChange={e => setTitle(e.target.value)}
                disabled={!!task}
              />
            </div>

            {/* Status & Priority */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="muted mb-2 text-xs font-semibold uppercase tracking-wide">Status</div>
                <select
                  className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-text focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/30"
                  value={status}
                  onChange={e => setStatus(e.target.value as TaskStatus)}
                >
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="DONE">DONE</option>
                </select>
              </div>

              <div>
                <div className="muted mb-2 text-xs font-semibold uppercase tracking-wide">Priority</div>
                <select
                  className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-text focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/30"
                  value={priority}
                  onChange={e => setPriority(e.target.value as TaskPriority)}
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>
            </div>

            {/* Description */}
                        <div>
              <div className="muted mb-2 text-xs font-semibold uppercase tracking-wide">Description</div>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Optional description"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            <div>
              <div className="muted mb-2 text-xs font-semibold uppercase tracking-wide">Deadline</div>
              <input
                type="datetime-local"
                className="form-input"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
              />
            </div>

            {/* Action buttons */}
            <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              {task ? (
                <>
                  <Button variant="danger" onClick={handleDelete}>Delete</Button>
                  <Button onClick={handleSubmit}>Save</Button>
                </>
              ) : (
                <Button onClick={handleSubmit} disabled={!title.trim()}>Create</Button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 mt-4">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
