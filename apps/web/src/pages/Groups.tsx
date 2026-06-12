import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useGroupStore } from "../store/groupStore";
import { Button } from "../components/Button";
import { GroupModal } from "../components/GroupModal";
import { JoinGroupModal } from "../components/JoinGroupModal";

import styles from "./GroupTasks.module.css";

export function Groups() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const groups = Object.values(useGroupStore((state) => state.groups));

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await api<any[]>("/api/groups");
        useGroupStore.getState().setAll(data);
        setError(null);
      } catch (e: any) {
        setError(e?.message ?? "Не вдалося виконати запит");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="groups-page">
      <div className={`${styles.groupSection} ${styles.groupSectionCenter}`}>
        <div className={styles.groupSection__wrapper}>
          <h1 className={styles.groupSection__title}>Групи</h1>
          <p className={styles.groupSection__subtitle}>
            Спільні простори для цілеспрямованої співпраці вашої команди.
          </p>
          <div className="groups-hero__actions">
            <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
              Створити групу
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setIsJoinOpen(true)}>
              Увійти в групу
            </Button>
          </div>
        </div>
      </div>

      <div className="groups-page__content">
        {loading && <div className="groups-page__status">Завантаження…</div>}
        {error && <div className="alert alert--error">{error}</div>}

        {!loading && groups.length > 0 && (
          <div className="groups-grid">
            {groups.map((g) => (
              <button
                key={g.id}
                type="button"
                className="group-card"
                onClick={() => navigate(`/groups/${g.id}/tasks`)}
              >
                <span className="group-card__title">{g.name}</span>
                <span className="group-card__desc">{g.description || "Опис ще не додано."}</span>
              </button>
            ))}
          </div>
        )}

        {!loading && groups.length === 0 && !error && (
          <div className="groups-empty">
            <p className="groups-empty__title">Ще немає груп</p>
            <p className="groups-empty__text">Створіть першу групу або приєднайтесь до існуючої.</p>
          </div>
        )}
      </div>

      <GroupModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <JoinGroupModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} />
    </div>
  );
}
