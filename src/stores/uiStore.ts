import { create } from "zustand";
interface UpgradeState {
  feature?: string;
  limit?: number;
  used?: number;
}
interface UiState {
  upgrade: UpgradeState | null;
  openUpgrade: (upgrade: UpgradeState) => void;
  closeUpgrade: () => void;
}
export const useUiStore = create<UiState>((set) => ({
  upgrade: null,
  openUpgrade: (upgrade) => set({ upgrade }),
  closeUpgrade: () => set({ upgrade: null }),
}));
