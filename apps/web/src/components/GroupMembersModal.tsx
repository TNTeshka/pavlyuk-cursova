import React, { useEffect, useState } from "react";
import { Button } from "./Button";
import { useGroups } from "../hooks/useGroups";

type GroupMembersModalProps = {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
};

export function GroupMembersModal({ isOpen, onClose, groupId }: GroupMembersModalProps) {
  const { getGroupMembers, addUser, removeUser, groups, fetchGroups } = useGroups();
  // Ensure groups are loaded – fetch on first open if empty
  React.useEffect(() => {
    if (isOpen && groups.length === 0) {
      fetchGroups();
    }
  }, [isOpen, groups, fetchGroups]);
  const group = groups?.find?.(g => g.id === groupId);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    getGroupMembers(groupId)
      .then(setMembers)
      .catch((e: any) => setError(e?.message ?? "Failed to load members"))
      .finally(() => setLoading(false));
  }, [isOpen, groupId, getGroupMembers]);

  const currentUserId = localStorage.getItem("userId");


  const handleJoin = async () => {
    if (!currentUserId) {
      setError("User not logged in");
      return;
    }
    try {
      await addUser(groupId, currentUserId);
      const refreshed = await getGroupMembers(groupId);
      setMembers(refreshed);
    } catch (e: any) {
      setError(e?.message ?? "Failed to join group");
    }
  };

  const handleLeave = async (memberId: string) => {
    try {
      await removeUser(groupId, memberId);
      const refreshed = await getGroupMembers(groupId);
      setMembers(refreshed);
    } catch (e: any) {
      setError(e?.message ?? "Failed to leave group");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-base font-semibold">Group members</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
        {loading && <div className="text-sm text-muted">Loading…</div>}
        {error && <div className="text-sm text-rose-200">{error}</div>}
        <ul className="mt-4 space-y-2">
          {members.map(m => (
            <li key={m.id} className="flex justify-between items-center">
              <span>{m.name ?? m.email ?? m.id}{group?.owner?.id === m.id && " (owner)"}</span>
              {/* Show leave button only for the current user */}
              {currentUserId === m.id && (

                <Button variant="danger" size="sm" onClick={() => handleLeave(m.id)}>
                  Leave
                </Button>
              )}
            </li>
          ))}
        </ul>
        {/* If current user not in members, show join button */}
        {currentUserId && !members.some(m => m.id === currentUserId) && (
          <Button className="mt-4" onClick={handleJoin}>Join group</Button>
        )}
      </div>
    </div>
  );
}
