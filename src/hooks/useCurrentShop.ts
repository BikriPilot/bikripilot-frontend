"use client";
import { useAuthStore } from "@/stores/authStore";
import { useShopStore } from "@/stores/shopStore";
export function useCurrentShop() {
  const user = useAuthStore((state) => state.user);
  const currentShopId = useShopStore((state) => state.currentShopId);
  const shop =
    user?.memberships.find(
      (membership) => membership.shopId === currentShopId,
    ) ??
    user?.memberships[0] ??
    null;
  return {
    shop,
    shopId: shop?.shopId ?? null,
    role: shop?.role ?? null,
    permissions: shop?.permissions ?? [],
    can: (permission: string) =>
      Boolean(shop?.permissions.includes(permission)),
  };
}
