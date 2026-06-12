import { useState, FormEvent } from "react";
import { api } from "../api";
import { useGroups } from "../hooks/useGroups";
import { useGroupStore } from "../store/groupStore";
import { Button } from "./Button";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function GroupModal({ isOpen, onClose }: Props) {
  const { createGroup } = useGroups();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createGroup({ name, description: description || undefined, password });
      const refreshed = await api<{ id: string; name: string; description?: string | null }[]>("/api/groups");
      useGroupStore.getState().setAll(refreshed);
      setName("");
      setDescription("");
      setPassword("");
      onClose();
    } catch (err: any) {
      setError(err?.message ?? "Не вдалося створити групу");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <div className="modal__title">
            <h2>Створити групу</h2>
            <p className="modal__subtitle">Організуйте роботу команди, проєкту або напрямку.</p>
          </div>
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Закрити
          </Button>
        </div>

        <form className="modal__body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="group-name">
              Назва групи
            </label>
            <input
              id="group-name"
              placeholder="Наприклад: Маркетинг Q2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={saving}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="group-password">
              Пароль
            </label>
            <input
              id="group-password"
              placeholder="Пароль для входу в групу"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={saving}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="group-description">
              Опис
            </label>
            <textarea
              id="group-description"
              placeholder="Необов'язковий опис групи"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={saving}
              className="form-input"
            />
          </div>

          {error && <div className="alert alert--error">{error}</div>}

          <div className="modal__footer">
            <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={saving}>
              Скасувати
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={saving || !name.trim()}>
              {saving ? "Створення…" : "Створити групу"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
