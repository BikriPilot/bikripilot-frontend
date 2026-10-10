"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { notificationsApi } from "@/lib/api/notifications.api";
import { queryKeys } from "@/lib/queryKeys";
import { useQuery } from "@tanstack/react-query";

export function NotificationBell() {
  const t = useTranslations("step8");
  const { shopId } = useCurrentShop();
  const query = useQuery({
    queryKey: [...queryKeys.notifications, shopId, "unread-count"],
    queryFn: () => notificationsApi.unreadCount(shopId!),
    enabled: Boolean(shopId),
  });
  const count = query.data?.count ?? 0;
  return (
    <Link
      href="/dashboard/notifications"
      className="relative grid size-10 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
      aria-label={t("notifications")}
    >
      <Bell size={18} />
      {count > 0 ? (
        <span className="absolute right-1 top-1 min-w-4 rounded-full bg-destructive px-1 text-center text-[10px] leading-4 text-destructive-foreground">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
