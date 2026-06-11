import create from "zustand";
import { devtools } from "zustand/middleware";

export type Group = {
  id: string;
  name: string;
  description?: string | null;
  // optional additional fields can be added later
};

type GroupMap = { [id: string]: Group };

type GroupState = {
  groups: GroupMap;
  addGroup: (group: Group) => void;
  updateGroup: (group: Group) => void;
  removeGroup: (groupId: string) => void;
  setAll: (groups: Group[]) => void;
};

export const useGroupStore = create<GroupState>()(
  devtools((set) => ({
    groups: {} as GroupMap,
    addGroup: (group) =>
      set((state) => ({ groups: { ...state.groups, [group.id]: group } })),
    updateGroup: (group) =>
      set((state) => ({ groups: { ...state.groups, [group.id]: group } })),
    removeGroup: (groupId) =>
      set((state) => {
        const copy = { ...state.groups };
        delete copy[groupId];
        return { groups: copy };
      }),
    setAll: (groups) =>
      set(() => ({
        groups: groups.reduce((acc, g) => ({ ...acc, [g.id]: g }), {} as GroupMap)
      }))
  }))
);
