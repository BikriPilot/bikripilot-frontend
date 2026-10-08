"use client";

import { useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SOCKET_EVENTS } from "@/constants/socketEvents";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { queryKeys } from "@/lib/queryKeys";
import { useAuthStore } from "@/stores/authStore";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { useShopStore } from "@/stores/shopStore";

export function SocketProvider() {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.accessToken);
  const { shopId } = useCurrentShop();
  const currentShopId = useShopStore((state) => state.currentShopId);

  const invalidateRealtimeQueries = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    if (currentShopId) {
      void queryClient.invalidateQueries({
        queryKey: ["entitlements", currentShopId],
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products(currentShopId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.orders(currentShopId),
      });
    }
  }, [currentShopId, queryClient]);

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      return;
    }
    const socket = connectSocket(token);
    if (!socket) return;
    socket.on("connect", invalidateRealtimeQueries);
    socket.on("connect_error", invalidateRealtimeQueries);
    return () => {
      socket.off("connect", invalidateRealtimeQueries);
      socket.off("connect_error", invalidateRealtimeQueries);
      disconnectSocket();
    };
  }, [invalidateRealtimeQueries, token]);

  useEffect(() => {
    if (!shopId || !token) return;
    const socket = connectSocket(token);
    if (!socket) return;
    socket.emit("shop:join", { shopId });
    return () => {
      socket.emit("shop:leave", { shopId });
    };
  }, [shopId, token]);

  useEffect(() => {
    const socket = connectSocket(token ?? "");
    if (!socket) return;
    const refreshNotifications = () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    };
    const refreshEntitlements = () => {
      if (!shopId) return;
      void queryClient.invalidateQueries({
        queryKey: ["entitlements", shopId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["subscription", shopId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["billing-invoices", shopId],
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.billingPlans });
    };
    socket.on(SOCKET_EVENTS.NOTIFICATION_NEW, refreshNotifications);
    socket.on(SOCKET_EVENTS.ENTITLEMENTS_CHANGED, refreshEntitlements);
    return () => {
      socket.off(SOCKET_EVENTS.NOTIFICATION_NEW, refreshNotifications);
      socket.off(SOCKET_EVENTS.ENTITLEMENTS_CHANGED, refreshEntitlements);
    };
  }, [queryClient, token, shopId]);

  return null;
}
