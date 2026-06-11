import { useState, FormEvent } from "react";

import { useGroups } from "../hooks/useGroups";
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

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createGroup({ name, description: description || undefined, password });
    setName("");
    setDescription("");
    setPassword("");
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal__title">Create group</h2>
        <p className="modal__subtitle">Organize work by team, project, or focus area.</p>
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
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="form-input"
            />
            <div className="mt-1 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button type="submit">Create group</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
