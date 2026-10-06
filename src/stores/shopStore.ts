import { create } from "zustand";
interface ShopState {
  currentShopId: string | null;
  setCurrentShopId: (id: string | null) => void;
}
export const useShopStore = create<ShopState>((set) => ({
  currentShopId: null,
  setCurrentShopId: (currentShopId) => set({ currentShopId }),
}));
