import { useEffect, useState } from "react";
import { Button } from "./Button";
import { useGroups } from "../hooks/useGroups";
import { GroupSettingsModal } from "./GroupSettingsModal";

type GroupMembersModalProps = {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  onLeftGroup?: () => void;
  onGroupUpdated?: () => void;
};

function memberLabel(member: { name?: string | null; email?: string; username?: string | null; id: string }) {
  return member.name ?? member.username ?? member.email ?? member.id;
}

export function GroupMembersModal({
  isOpen,
  onClose,
  groupId,
  onLeftGroup,
  onGroupUpdated,
}: GroupMembersModalProps) {
  const { getGroupMembers, addUser, removeUser, groups, fetchGroups } = useGroups();
  const group = groups?.find?.((g) => g.id === groupId);

  const [members, setMembers] = useState<any[]>([]);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const currentUserId = localStorage.getItem("userId");
  const isOwner = !!currentUserId && currentUserId === ownerId;
  const isMember = !!currentUserId && members.some((m) => m.id === currentUserId);

  const loadMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getGroupMembers(groupId);
      setMembers(data.members);
      setOwnerId(data.ownerId);
    } catch (e: any) {
      setError(e?.message ?? "Не вдалося завантажити учасників");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchGroups();
      loadMembers();
    }
  }, [isOpen, groupId]);

  const handleJoin = async () => {
    if (!currentUserId) {
      setError("Користувач не авторизований");
      return;
    }
    setActionId("join");
    setError(null);
    try {
      await addUser(groupId, currentUserId);
      await loadMembers();
    } catch (e: any) {
      setError(e?.message ?? "Не вдалося приєднатися до групи");
    } finally {
      setActionId(null);
    }
  };

  const handleLeave = async () => {
    if (!currentUserId) return;
    if (isOwner) {
      setError("Власник групи не може вийти. Спочатку передайте права або видаліть групу.");
      return;
    }
    setActionId(currentUserId);
    setError(null);
    try {
      await removeUser(groupId, currentUserId);
      onClose();
      onLeftGroup?.();
    } catch (e: any) {
      setError(e?.message ?? "Не вдалося вийти з групи");
    } finally {
      setActionId(null);
    }
  };

  const handleKick = async (memberId: string) => {
    if (!isOwner || memberId === ownerId) return;
    setActionId(memberId);
    setError(null);
    try {
      await removeUser(groupId, memberId);
      await loadMembers();
    } catch (e: any) {
      setError(e?.message ?? "Не вдалося вигнати учасника");
    } finally {
      setActionId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal__header">
            <div className="modal__title">
              <h2>Учасники: {group?.name ?? "Група"}</h2>
              <p className="modal__subtitle">
                {isOwner
                  ? "Ви керуєте цією групою. Можете змінювати налаштування та виганяти учасників."
                  : "Перегляд учасників групи."}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Закрити
            </Button>
          </div>

          <div className="modal__body">
            {isOwner && (
              <div className="group-members-toolbar">
                <Button variant="secondary" size="sm" type="button" onClick={() => setSettingsOpen(true)}>
                  Налаштування групи
                </Button>
              </div>
            )}

            {loading && <div className="text-sm text-[var(--color-muted)]">Завантаження…</div>}
            {error && <div className="alert alert--error">{error}</div>}

            <ul className="group-members-list">
              {members.map((m) => {
                const isGroupOwner = m.id === ownerId;
                const isSelf = m.id === currentUserId;
                const canKick = isOwner && !isGroupOwner;

                return (
                  <li key={m.id} className="group-members-list__item">
                    <div className="group-members-list__info">
                      <span className="group-members-list__name">{memberLabel(m)}</span>
                      {isGroupOwner && <span className="group-members-badge">Головний</span>}
                      {isSelf && !isGroupOwner && <span className="group-members-badge group-members-badge--self">Ви</span>}
                    </div>
                    <div className="group-members-list__actions">
                      {canKick && (
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={actionId === m.id}
                          onClick={() => handleKick(m.id)}
                        >
                          {actionId === m.id ? "…" : "Вигнати"}
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="group-members-footer">
              {currentUserId && isMember && !isOwner && (
                <Button variant="danger" size="sm" disabled={actionId === currentUserId} onClick={handleLeave}>
                  {actionId === currentUserId ? "Вихід…" : "Вийти з групи"}
                </Button>
              )}
              {currentUserId && !isMember && (
                <Button variant="primary" size="sm" disabled={actionId === "join"} onClick={handleJoin}>
                  {actionId === "join" ? "Приєднання…" : "Приєднатися до групи"}
                </Button>
              )}
              {isOwner && (
                <p className="group-members-note">Як власник, ви не можете вийти з групи через це вікно.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <GroupSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        groupId={groupId}
        groupName={group?.name ?? ""}
        groupDescription={group?.description}
        onUpdated={() => {
          fetchGroups();
          onGroupUpdated?.();
        }}
      />
    </>
  );
}
