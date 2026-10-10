"use client";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { ErrorState } from "@/components/common/PageStates";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { channelsApi } from "@/lib/api/channels.api";
import { CredentialSecurityNotice } from "@/components/common/CredentialSecurityNotice";

export default function ChannelsPage() {
  const t = useTranslations("channels");
  const { shopId } = useCurrentShop();
  const search = useSearchParams();
  const query = useQuery({
    queryKey: ["channels", shopId],
    queryFn: () => channelsApi.list(shopId!),
    enabled: Boolean(shopId),
  });
  const pendingId = search.get("pending");
  const pending = useQuery({
    queryKey: ["channel-pending", shopId, pendingId],
    queryFn: () => channelsApi.pending(shopId!, pendingId!),
    enabled: Boolean(shopId && pendingId),
  });
  const connect = async () => {
    try {
      const result = await channelsApi.oauthUrl(shopId!);
      window.location.assign(result.url);
    } catch {
      toast.error(t("error"));
    }
  };
  if (query.isPending)
    return <div className="h-40 animate-pulse rounded-2xl bg-muted" />;
  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />;
  const disconnect = async (id: string) => {
    try {
      await channelsApi.disconnect(shopId!, id);
      await query.refetch();
      toast.success(t("disconnected"));
    } catch {
      toast.error(t("error"));
    }
  };
  const reconnect = async () => {
    await connect();
  };
  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={
          <button
            type="button"
            onClick={() => void connect()}
            className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            {t("connect")}
          </button>
        }
      />
      <CredentialSecurityNotice provider="meta" />
      {pending.data ? (
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="font-semibold">{t("choosePage")}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {pending.data.pages.map((page) => (
              <button
                key={page.pageId}
                type="button"
                onClick={() =>
                  void channelsApi
                    .connect(shopId!, pendingId!, page.pageId)
                    .then(() => query.refetch())
                    .then(() => toast.success(t("connected")))
                    .catch(() => toast.error(t("error")))
                }
                className="flex min-h-14 items-center gap-3 rounded-xl border p-3 text-left hover:bg-muted"
              >
                <span className="font-medium">{page.name}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}
      {query.data.length === 0 ? (
        <section className="rounded-2xl border bg-card p-8 text-center">
          <p className="font-semibold">{t("empty")}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("emptyDescription")}
          </p>
        </section>
      ) : (
        <div className="grid gap-4">
          {query.data.map((channel) => (
            <article
              key={channel.id}
              className="flex flex-col gap-4 rounded-2xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h2 className="font-semibold">{channel.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {channel.status === "ACTIVE"
                    ? t("active")
                    : t("needsReconnect")}
                </p>
              </div>
              <div className="flex gap-2">
                {channel.status === "ACTIVE" ? (
                  <button
                    type="button"
                    onClick={() => void disconnect(channel.id)}
                    className="min-h-11 rounded-lg border px-3 text-sm"
                  >
                    {t("disconnect")}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void reconnect()}
                    className="min-h-11 rounded-lg bg-primary px-3 text-sm text-primary-foreground"
                  >
                    {t("reconnect")}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
