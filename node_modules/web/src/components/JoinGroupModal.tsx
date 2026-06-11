import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGroups } from "../hooks/useGroups";
import { Button } from "./Button";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function JoinGroupModal({ isOpen, onClose }: Props) {
  const { groups, addUser } = useGroups();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const grp = groups.find((g) => g.name === name.trim());
    if (!grp) {
      setError("Group not found");
      return;
    }
    const currentUserId = localStorage.getItem("userId");
    if (!currentUserId) {
      setError("User not logged in");
      return;
    }
    // Attempt to join group with password
            try {
          await addUser(grp.id, currentUserId, password);
              } catch (e: any) {
          setError(e?.message ?? "Failed to join group");
          return;
        }
    // Reset fields
    setName("");
    setPassword("");
    setError(null);
    navigate(`/groups/${grp.id}/tasks`);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal__title">Join group</h2>
        <form onSubmit={handleSubmit}>
          <div className="mt-4 grid gap-3">
            <input
              placeholder="Group name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="form-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />
            {error && <div className="text-rose-500 text-sm">{error}</div>}
            <div className="flex justify-end gap-2 mt-1">
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button type="submit">Join</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
