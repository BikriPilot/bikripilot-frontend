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
        <span className="absolute -top-1 -right-1 flex min-w-5 h-5 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 px-1 text-[11px] font-bold text-white shadow-md shadow-rose-500/30 ring-2 ring-background transition-transform animate-in zoom-in-50">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
