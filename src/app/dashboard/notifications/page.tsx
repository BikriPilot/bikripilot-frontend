"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/common/PageHeader";
import { CardListSkeleton } from "@/components/common/skeletons";
import { ErrorState, EmptyState } from "@/components/common/PageStates";
import { notificationsApi } from "@/lib/api/notifications.api";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { dateFromNow } from "@/lib/date";
import { toast } from "sonner";
export default function NotificationsPage() {
  const t = useTranslations("step8");
  const { shopId } = useCurrentShop();
  const query = useQuery({
    queryKey: ["notifications", shopId],
    queryFn: () => notificationsApi.list(shopId!),
    enabled: Boolean(shopId),
  });
  if (query.isPending) return <CardListSkeleton rows={5} />;
  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />;
  const notifications = query.data ?? [];
  const markAll = async () => {
    await notificationsApi.markRead(shopId!, { all: true });
    toast.success(t("saved"));
    await query.refetch();
  };
  return (
    <div className="space-y-6">
      <PageHeader
        title={t("notificationsTitle")}
        description={t("notificationsDescription")}
        action={
          <button
            type="button"
            onClick={() => void markAll()}
            className="min-h-11 rounded-lg border px-4 text-sm font-semibold"
          >
            {t("markAllRead")}
          </button>
        }
      />
      {notifications.length === 0 ? (
        <EmptyState title={t("noNotifications")} />
      ) : (
        <div className="divide-y rounded-2xl border bg-card">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 ${notification.readAt ? "" : "bg-primary-soft/40"}`}
            >
              {notification.link ? (
                <Link href={notification.link} className="block">
                  <Notice notification={notification} />
                </Link>
              ) : (
                <Notice notification={notification} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function Notice({
  notification,
}: {
  notification: { title: string; body: string | null; createdAt: string };
}) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium">{notification.title}</p>
        <time className="shrink-0 text-xs text-muted-foreground">
          {dateFromNow(notification.createdAt)}
        </time>
      </div>
      {notification.body ? (
        <p className="mt-1 text-sm text-muted-foreground">
          {notification.body}
        </p>
      ) : null}
    </div>
  );
}
