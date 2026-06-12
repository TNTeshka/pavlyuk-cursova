import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGroups } from "../hooks/useGroups";
import { Button } from "./Button";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function JoinGroupModal({ isOpen, onClose }: Props) {
  const { groups, fetchGroups, addUser } = useGroups();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (isOpen) fetchGroups();
  }, [isOpen, fetchGroups]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const grp = groups.find((g) => g.name === name.trim());
    if (!grp) {
      setError("Групу не знайдено");
      return;
    }
    const currentUserId = localStorage.getItem("userId");
    if (!currentUserId) {
      setError("Користувач не авторизований");
      return;
    }

    setJoining(true);
    try {
      await addUser(grp.id, currentUserId, password);
      setName("");
      setPassword("");
      navigate(`/groups/${grp.id}/tasks`);
      onClose();
    } catch (err: any) {
      setError(err?.message ?? "Не вдалося приєднатися до групи");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <div className="modal__title">
            <h2>Приєднатися до групи</h2>
            <p className="modal__subtitle">Введіть назву групи та пароль, щоб увійти.</p>
          </div>
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Закрити
          </Button>
        </div>

        <form className="modal__body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="join-group-name">
              Назва групи
            </label>
            <input
              id="join-group-name"
              placeholder="Точна назва групи"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={joining}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="join-group-password">
              Пароль
            </label>
            <input
              id="join-group-password"
              type="password"
              placeholder="Пароль групи"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={joining}
              className="form-input"
            />
          </div>

          {error && <div className="alert alert--error">{error}</div>}

          <div className="modal__footer">
            <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={joining}>
              Скасувати
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={joining || !name.trim()}>
              {joining ? "Вхід…" : "Увійти в групу"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
