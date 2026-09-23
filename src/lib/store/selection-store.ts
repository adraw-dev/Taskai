import { create } from "zustand";

interface SelectionState {
  selectionMode: boolean;
  selectedTaskIds: Set<string>;
  activeTaskId: string | null;
  aiDialogOpen: boolean;
  enterSelectionMode: (taskId?: string) => void;
  exitSelectionMode: () => void;
  toggleTaskSelection: (taskId: string) => void;
  clearSelection: () => void;
  openTaskDetail: (taskId: string) => void;
  closeTaskDetail: () => void;
  setAiDialogOpen: (open: boolean) => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selectionMode: false,
  selectedTaskIds: new Set(),
  activeTaskId: null,
  aiDialogOpen: false,
  enterSelectionMode: (taskId) =>
    set(() => ({
      selectionMode: true,
      selectedTaskIds: taskId ? new Set([taskId]) : new Set(),
    })),
  exitSelectionMode: () =>
    set(() => ({ selectionMode: false, selectedTaskIds: new Set() })),
  toggleTaskSelection: (taskId) =>
    set((state) => {
      const next = new Set(state.selectedTaskIds);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return { selectedTaskIds: next };
    }),
  clearSelection: () => set(() => ({ selectedTaskIds: new Set() })),
  openTaskDetail: (taskId) => set(() => ({ activeTaskId: taskId })),
  closeTaskDetail: () => set(() => ({ activeTaskId: null })),
  setAiDialogOpen: (open) => set(() => ({ aiDialogOpen: open })),
}));
