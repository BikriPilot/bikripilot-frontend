"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import Link from "next/link";
import {
  QrCode,
  RefreshCw,
  CheckCircle2,
  X,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { ErrorState } from "@/components/common/PageStates";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { channelsApi } from "@/lib/api/channels.api";
import { shopsApi } from "@/lib/api/shops.api";
import { useAuthStore } from "@/stores/authStore";
import { CredentialSecurityNotice } from "@/components/common/CredentialSecurityNotice";
import type { ChannelDTO } from "@/types/channel";

function FacebookIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function WhatsAppIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.301-.15-1.777-.878-2.052-.978-.276-.1-.476-.15-.676.15-.2.301-.776.978-.952 1.179-.176.2-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.493-.895-.798-1.5-1.784-1.675-2.085-.175-.301-.019-.464.132-.614.135-.135.301-.351.451-.527.151-.176.201-.301.301-.502.101-.2.05-.376-.025-.526-.075-.151-.676-1.632-.927-2.233-.244-.585-.493-.506-.677-.515-.175-.009-.375-.011-.576-.011-.2 0-.526.075-.802.376-.275.301-1.052 1.028-1.052 2.507 0 1.48 1.077 2.908 1.228 3.109.15.2 2.12 3.238 5.136 4.542.717.311 1.277.496 1.714.635.72.229 1.376.197 1.895.12.578-.087 1.777-.727 2.028-1.429.25-.702.25-1.304.175-1.429-.075-.125-.276-.201-.577-.351zM12.046 2C6.505 2 2 6.505 2 12.046c0 1.98.577 3.829 1.574 5.394L2 22l4.673-1.53c1.517.917 3.284 1.442 5.373 1.442 5.541 0 10.046-4.505 10.046-10.046C22.092 6.505 17.587 2 12.046 2zm0 18.258c-1.748 0-3.37-.502-4.747-1.368l-.341-.213-2.775.908.927-2.705-.233-.371c-.966-1.534-1.478-3.32-1.478-5.163 0-4.639 3.774-8.413 8.413-8.413 4.639 0 8.413 3.774 8.413 8.413 0 4.639-3.774 8.413-8.413 8.413z" />
    </svg>
  );
}

export default function ChannelsPage() {
  const t = useTranslations("channels");
  const { shopId } = useCurrentShop();
  const search = useSearchParams();

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [qrStatus, setQrStatus] = useState<
    "CONNECTED" | "SCAN_QR" | "DISCONNECTED" | "LOADING"
  >("LOADING");
  const [connectedPhone, setConnectedPhone] = useState<string | null>(null);
  const [isRefreshingQr, setIsRefreshingQr] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const user = useAuthStore((state) => state.user);
  const shopQuery = useQuery({
    queryKey: ["shop", shopId],
    queryFn: () => shopsApi.get(shopId!),
    enabled: Boolean(shopId),
  });
  const shop = shopQuery.data;

  const isProfileComplete = Boolean(
    user?.name?.trim() && user?.phone?.trim() && user?.email && user?.district,
  );
  const isShopComplete = Boolean(
    shop?.name?.trim() && shop?.logoUrl && shop?.facebookPageUrl?.trim(),
  );
  const canConnectChannels = isProfileComplete && isShopComplete;

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

  const connectFacebook = async () => {
    if (!canConnectChannels) {
      toast.error(
        "Please complete your profile and shop details before connecting channels.",
      );
      return;
    }
    try {
      const result = await channelsApi.oauthUrl(shopId!);
      window.location.assign(result.url);
    } catch {
      toast.error(t("error"));
    }
  };

  const checkWhatsAppStatus = useCallback(async () => {
    if (!shopId) return;
    try {
      const statusRes = await channelsApi.whatsappStatus(shopId);
      setQrStatus(statusRes.status);
      if (statusRes.qr) {
        setQrCodeData(statusRes.qr);
      }
      if (statusRes.phone) {
        setConnectedPhone(statusRes.phone);
      }

      if (statusRes.status === "CONNECTED") {
        toast.success(t("whatsappConnected"));
        void query.refetch();
        // Give the seller 1.5s to see the green checkmark before closing modal
        setTimeout(() => {
          setQrModalOpen(false);
        }, 1500);
      }
    } catch {
      // Ignored for polling
    }
  }, [shopId, query, t]);

  const openWhatsAppModal = async () => {
    if (!shopId) return;
    if (!canConnectChannels) {
      toast.error(
        "Please complete your profile and shop details before connecting channels.",
      );
      return;
    }
    setQrModalOpen(true);
    setQrStatus("LOADING");
    setQrCodeData(null);
    setConnectedPhone(null);

    try {
      const res = await channelsApi.whatsappStart(shopId);
      setQrStatus(res.status);
      if (res.qr) {
        setQrCodeData(res.qr);
      }
      if (res.phone) {
        setConnectedPhone(res.phone);
      }
      if (res.status === "CONNECTED") {
        toast.success(t("whatsappConnected"));
        void query.refetch();
        setTimeout(() => setQrModalOpen(false), 1500);
      }
    } catch {
      toast.error(t("error"));
      setQrStatus("DISCONNECTED");
    }
  };

  const refreshQr = async () => {
    if (!shopId) return;
    setIsRefreshingQr(true);
    try {
      const res = await channelsApi.whatsappStart(shopId);
      setQrStatus(res.status);
      if (res.qr) {
        setQrCodeData(res.qr);
      }
      if (res.phone) {
        setConnectedPhone(res.phone);
      }
    } catch {
      toast.error(t("error"));
    } finally {
      setIsRefreshingQr(false);
    }
  };

  // Poll WhatsApp status while QR modal is open and not yet connected
  useEffect(() => {
    if (!qrModalOpen || qrStatus === "CONNECTED") {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    pollIntervalRef.current = setInterval(() => {
      void checkWhatsAppStatus();
    }, 2500);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [qrModalOpen, qrStatus, checkWhatsAppStatus]);

  const disconnect = async (channel: ChannelDTO) => {
    if (!shopId) return;
    setActionInProgress(channel.id);
    try {
      if (channel.type === "WHATSAPP") {
        await channelsApi.whatsappDisconnect(shopId);
        toast.success(t("whatsappDisconnected"));
      } else {
        await channelsApi.disconnect(shopId, channel.id);
        toast.success(t("disconnected"));
      }
      await query.refetch();
    } catch {
      toast.error(t("error"));
    } finally {
      setActionInProgress(null);
    }
  };

  const reconnect = async (channel: ChannelDTO) => {
    if (channel.type === "WHATSAPP") {
      void openWhatsAppModal();
    } else {
      void connectFacebook();
    }
  };

  if (query.isPending) {
    return (
      <div className="space-y-6">
        <div className="h-20 animate-pulse rounded-2xl bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-44 animate-pulse rounded-2xl bg-muted" />
          <div className="h-44 animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  if (query.isError) {
    return <ErrorState onRetry={() => void query.refetch()} />;
  }

  const channelsList = query.data ?? [];
  const hasFacebook = channelsList.some(
    (c) =>
      (c.type === "FACEBOOK" || c.type === "MESSENGER") &&
      c.status === "ACTIVE",
  );
  const activeWhatsApp = channelsList.find(
    (c) => c.type === "WHATSAPP" && c.status === "ACTIVE",
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
      />

      <CredentialSecurityNotice provider="meta" />

      {/* Prerequisite Alert Banner */}
      {!canConnectChannels && (
        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 space-y-4 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-foreground">
                Before linking Facebook or WhatsApp, you must complete your seller credentials and store identity.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 text-xs">
            <div className={`p-3.5 rounded-xl border ${isProfileComplete ? "bg-card/70 border-emerald-500/30" : "bg-card border-amber-500/30"}`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  {isProfileComplete ? (
                    <CheckCircle2 size={14} className="text-emerald-600" />
                  ) : (
                    <span className="size-2 rounded-full bg-amber-500" />
                  )}
                  <span>1. Seller Profile ({isProfileComplete ? "Complete" : "Incomplete"})</span>
                </span>
                <Link href="/dashboard/profile" className="text-xs font-semibold text-primary hover:underline">
                  Edit Profile →
                </Link>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Required: Name, Phone, Email, District
              </p>
            </div>

            <div className={`p-3.5 rounded-xl border ${isShopComplete ? "bg-card/70 border-emerald-500/30" : "bg-card border-amber-500/30"}`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  {isShopComplete ? (
                    <CheckCircle2 size={14} className="text-emerald-600" />
                  ) : (
                    <span className="size-2 rounded-full bg-amber-500" />
                  )}
                  <span>2. Shop Details ({isShopComplete ? "Complete" : "Incomplete"})</span>
                </span>
                <Link href="/dashboard/settings" className="text-xs font-semibold text-primary hover:underline">
                  Edit Shop →
                </Link>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Required: Shop Name, Logo Image, Facebook Page URL
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Available Channels (Facebook + WhatsApp) */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Facebook Messenger Card */}
        <div className="flex flex-col justify-between rounded-2xl border bg-card p-5 shadow-xs transition-shadow hover:shadow-md">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex size-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                <FacebookIcon className="size-6" />
              </div>
              {hasFacebook ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  {t("active")}
                </span>
              ) : null}
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                {t("facebookTitle")}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {t("facebookDesc")}
              </p>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t">
            <button
              type="button"
              onClick={() => void connectFacebook()}
              className={`inline-flex w-full min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-xs font-semibold shadow-xs transition-colors ${
                canConnectChannels
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-muted text-muted-foreground border hover:bg-muted/80"
              }`}
            >
              <FacebookIcon className="size-4" />
              <span>{canConnectChannels ? t("connect") : "Complete Details to Connect"}</span>
            </button>
          </div>
        </div>

        {/* WhatsApp QR Scan Card */}
        <div className="flex flex-col justify-between rounded-2xl border bg-card p-5 shadow-xs transition-shadow hover:shadow-md">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <WhatsAppIcon className="size-6" />
              </div>
              {activeWhatsApp ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  {t("active")}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  No Card Needed
                </span>
              )}
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                {t("whatsappTitle")}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {t("whatsappDesc")}
              </p>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t">
            <button
              type="button"
              onClick={() => void openWhatsAppModal()}
              className={`inline-flex w-full min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-xs font-semibold shadow-xs transition-colors ${
                canConnectChannels
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-muted text-muted-foreground border hover:bg-muted/80"
              }`}
            >
              <QrCode size={16} />
              <span>{canConnectChannels ? t("connectWhatsApp") : "Complete Details to Connect"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Facebook OAuth pending page selection */}
      {pending.data ? (
        <section className="rounded-2xl border bg-card p-5 shadow-xs">
          <h2 className="font-semibold text-foreground">{t("choosePage")}</h2>
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
                className="flex min-h-14 items-center gap-3 rounded-xl border p-3 text-left hover:bg-muted transition-colors"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <FacebookIcon className="size-5" />
                </div>
                <span className="font-medium text-sm">{page.name}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {/* Connected Channels List */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {t("title")}
        </h2>

        {channelsList.length === 0 ? (
          <div className="rounded-2xl border bg-card p-8 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-muted text-muted-foreground mb-3">
              <QrCode size={22} />
            </div>
            <p className="font-semibold text-foreground">{t("empty")}</p>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              {t("emptyDescription")}
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {channelsList.map((channel) => {
              const isWhatsApp = channel.type === "WHATSAPP";
              const isActing = actionInProgress === channel.id;

              return (
                <article
                  key={channel.id}
                  className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`grid size-11 place-items-center rounded-xl shrink-0 ${
                        isWhatsApp
                          ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "bg-blue-500/10 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                      }`}
                    >
                      {isWhatsApp ? (
                        <WhatsAppIcon className="size-6" />
                      ) : (
                        <FacebookIcon className="size-6" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm text-foreground">
                          {channel.name}
                        </h3>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                            isWhatsApp
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                          }`}
                        >
                          {isWhatsApp ? "WhatsApp" : "Facebook"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {channel.status === "ACTIVE" ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            ● {t("active")}
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            ▲ {t("needsReconnect")}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {channel.status === "ACTIVE" ? (
                      <button
                        type="button"
                        disabled={isActing}
                        onClick={() => void disconnect(channel)}
                        className="min-h-9 rounded-lg border px-3 text-xs font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                      >
                        {isActing ? "..." : t("disconnect")}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isActing}
                        onClick={() => void reconnect(channel)}
                        className="min-h-9 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                      >
                        {t("reconnect")}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* WhatsApp QR Modal */}
      {qrModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <WhatsAppIcon className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-foreground">
                    {t("whatsappModalTitle")}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    WhatsApp Multi-Device Link
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
                aria-label={t("close")}
              >
                <X size={16} />
              </button>
            </div>

            {/* Step-by-step instructions */}
            <div className="mt-4 rounded-xl border bg-muted/30 p-3 text-xs space-y-1.5 text-muted-foreground">
              <p className="font-medium text-foreground">{t("whatsappStep1")}</p>
              <p>{t("whatsappStep2")}</p>
              <p>{t("whatsappStep3")}</p>
            </div>

            {/* QR Code display area */}
            <div className="mt-5 flex flex-col items-center justify-center">
              {qrStatus === "CONNECTED" ? (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-2 animate-in fade-in">
                  <div className="grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                    <CheckCircle2 size={32} />
                  </div>
                  <p className="font-semibold text-foreground text-sm">
                    {t("whatsappConnected")}
                  </p>
                  {connectedPhone ? (
                    <p className="text-xs text-muted-foreground">
                      +{connectedPhone}
                    </p>
                  ) : null}
                </div>
              ) : qrCodeData ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="rounded-2xl border bg-white p-3 shadow-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrCodeData}
                      alt="WhatsApp QR Code"
                      className="size-56 object-contain"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{t("waitingForScan")}</span>
                  </div>
                  <button
                    type="button"
                    disabled={isRefreshingQr}
                    onClick={() => void refreshQr()}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <RefreshCw
                      size={12}
                      className={isRefreshingQr ? "animate-spin" : ""}
                    />
                    <span>{t("refreshQr")}</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <RefreshCw size={24} className="animate-spin text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    {t("generatingQr")}
                  </p>
                </div>
              )}
            </div>

            {/* Security notice & Footer */}
            <div className="mt-5 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 text-[11px]">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>Multi-Device 24/7 AI Persistent</span>
              </span>
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
