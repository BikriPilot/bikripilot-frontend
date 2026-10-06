"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth.api";
import { useAuthStore } from "@/stores/authStore";
import { useShopStore } from "@/stores/shopStore";
export function useAuth(required = true) {
  const router = useRouter();
  const { user, accessToken, setAuth, clear } = useAuthStore();
  const [isBootstrapping, setBootstrapping] = useState(!user);
  useEffect(() => {
    if (user) return;
    let active = true;
    authApi
      .refresh()
      .then((result) => {
        if (active) {
          setAuth(result.accessToken, result.user);
          setBootstrapping(false);
        }
      })
      .catch(() => {
        if (active) {
          clear();
          setBootstrapping(false);
          if (required)
            router.replace(
              `/login?next=${encodeURIComponent(window.location.pathname)}`,
            );
        }
      });
    return () => {
      active = false;
    };
  }, [clear, required, router, setAuth, user]);
  useEffect(() => {
    if (!user || user.memberships.length === 0) return;
    const current = useShopStore.getState().currentShopId;
    if (
      !current ||
      !user.memberships.some((membership) => membership.shopId === current)
    )
      useShopStore.getState().setCurrentShopId(user.memberships[0].shopId);
  }, [user]);
  return { user, accessToken, isBootstrapping };
}
