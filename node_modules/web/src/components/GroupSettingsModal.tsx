import { FormEvent, useEffect, useState } from "react";
import { useGroups } from "../hooks/useGroups";
import { Button } from "./Button";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  groupDescription?: string | null;
  onUpdated?: () => void;
};

export function GroupSettingsModal({
  isOpen,
  onClose,
  groupId,
  groupName,
  groupDescription,
  onUpdated,
}: Props) {
  const { updateGroup } = useGroups();
  const [name, setName] = useState(groupName);
  const [description, setDescription] = useState(groupDescription ?? "");
  const [password, setPassword] = useState("");
  const [clearPassword, setClearPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName(groupName);
    setDescription(groupDescription ?? "");
    setPassword("");
    setClearPassword(false);
    setError(null);
  }, [isOpen, groupName, groupDescription]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError(null);
    try {
      await updateGroup(groupId, {
        name: name.trim(),
        description: description.trim() || null,
        password: clearPassword ? null : password.trim() || undefined,
      });
      onUpdated?.();
      onClose();
    } catch (err: any) {
      setError(err?.message ?? "Не вдалося оновити групу");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop modal-backdrop--nested" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <div className="modal__title">
            <h2>Налаштування групи</h2>
            <p className="modal__subtitle">Змініть назву, опис або пароль для входу.</p>
          </div>
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Закрити
          </Button>
        </div>

        <form className="modal__body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="settings-group-name">
              Назва групи
            </label>
            <input
              id="settings-group-name"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="settings-group-description">
              Опис
            </label>
            <textarea
              id="settings-group-description"
              className="form-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Необов'язковий опис групи"
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="settings-group-password">
              Новий пароль
            </label>
            <input
              id="settings-group-password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Залиште порожнім, щоб не змінювати"
              disabled={saving || clearPassword}
            />
            <label className="group-settings-check">
              <input
                type="checkbox"
                checked={clearPassword}
                onChange={(e) => setClearPassword(e.target.checked)}
                disabled={saving}
              />
              <span>Прибрати пароль групи</span>
            </label>
          </div>

          {error && <div className="alert alert--error">{error}</div>}

          <div className="modal__footer">
            <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={saving}>
              Скасувати
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={saving || !name.trim()}>
              {saving ? "Збереження…" : "Зберегти"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
