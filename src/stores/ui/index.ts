import { create } from "zustand";

export type UIView = "main" | "tagCreation";

export interface UIState {
  currentView: UIView;
}

export interface UIStateActions {
  setCurrentView: (view: UIView) => void;
}

export const useUIStore = create<UIState & UIStateActions>((set) => ({
  currentView: "main",
  setCurrentView: (view) => set({ currentView: view }),
}));
