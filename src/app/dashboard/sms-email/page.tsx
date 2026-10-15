"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  MessageSquare,
  Mail,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  BellRing,
  Zap,
  Info,
} from "lucide-react";
import { CardListSkeleton } from "@/components/common/skeletons";
import { ErrorState, EmptyState } from "@/components/common/PageStates";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { notificationConfigApi } from "@/lib/api/notification-config.api";
import type {
  ShopNotificationConfigDTO,
  UpdateShopNotificationConfigInput,
  SendManualInput,
} from "@/types/notification-config";

export default function SmsEmailSettingsPage() {
  const t = useTranslations("smsEmail");
  const { shopId } = useCurrentShop();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"config" | "logs">("config");

  // Query config
  const configQuery = useQuery({
    queryKey: ["notificationConfig", shopId],
    queryFn: () => notificationConfigApi.getConfig(shopId!),
    enabled: Boolean(shopId),
  });

  if (configQuery.isPending) {
    return <CardListSkeleton rows={4} />;
  }

  if (configQuery.isError || !configQuery.data) {
    return <ErrorState onRetry={() => void configQuery.refetch()} />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Tabs */}
      <div className="flex border-b border-border/60">
        <button
          type="button"
          onClick={() => setActiveTab("config")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-all ${
            activeTab === "config"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <BellRing className="size-4" />
          <span>{t("title")}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("logs")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-all ${
            activeTab === "logs"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock className="size-4" />
          <span>{t("logsTitle")}</span>
        </button>
      </div>

      {activeTab === "config" ? (
        <div className="space-y-8">
          <ConfigForm
            config={configQuery.data}
            shopId={shopId!}
            onUpdated={() => {
              void queryClient.invalidateQueries({
                queryKey: ["notificationConfig", shopId],
              });
            }}
          />

          {/* Manual Send Section */}
          <ManualDispatchCard
            shopId={shopId!}
            config={configQuery.data}
            onSent={() => {
              void queryClient.invalidateQueries({
                queryKey: ["notificationLogs", shopId],
              });
            }}
          />
        </div>
      ) : (
        <LogsTab shopId={shopId!} />
      )}
    </div>
  );
}

function ConfigForm({
  config,
  shopId,
  onUpdated,
}: {
  config: ShopNotificationConfigDTO;
  shopId: string;
  onUpdated: () => void;
}) {
  const t = useTranslations("smsEmail");

  // Form states
  // SMS
  const [smsEnabled, setSmsEnabled] = useState(config.smsEnabled);
  const [bulksmsSenderId, setBulksmsSenderId] = useState(config.bulksmsSenderId ?? "");
  const [bulksmsApiKey, setBulksmsApiKey] = useState("");

  // Email
  const [emailEnabled, setEmailEnabled] = useState(config.emailEnabled);
  const [smtpHost, setSmtpHost] = useState(config.smtpHost ?? "");
  const [smtpPort, setSmtpPort] = useState<number>(config.smtpPort ?? 587);
  const [smtpSecure, setSmtpSecure] = useState(config.smtpSecure);
  const [smtpUser, setSmtpUser] = useState(config.smtpUser ?? "");
  const [smtpPass, setSmtpPass] = useState("");
  const [emailFrom, setEmailFrom] = useState(config.emailFrom ?? "");

  // Toggle saving states
  const [isSavingSmsToggle, setIsSavingSmsToggle] = useState(false);
  const [isSavingEmailToggle, setIsSavingEmailToggle] = useState(false);

  // Order SMS Triggers
  const [notifyOrderCreatedSms, setNotifyOrderCreatedSms] = useState(config.notifyOrderCreatedSms);
  const [notifyOrderConfirmedSms, setNotifyOrderConfirmedSms] = useState(config.notifyOrderConfirmedSms);
  const [notifyOrderShippedSms, setNotifyOrderShippedSms] = useState(config.notifyOrderShippedSms);
  const [notifyOrderDeliveredSms, setNotifyOrderDeliveredSms] = useState(config.notifyOrderDeliveredSms);
  const [notifyOrderCancelledSms, setNotifyOrderCancelledSms] = useState(config.notifyOrderCancelledSms);
  const [notifyOrderReturnedSms, setNotifyOrderReturnedSms] = useState(config.notifyOrderReturnedSms);

  // Order Email Triggers
  const [notifyOrderCreatedEmail, setNotifyOrderCreatedEmail] = useState(config.notifyOrderCreatedEmail);
  const [notifyOrderConfirmedEmail, setNotifyOrderConfirmedEmail] = useState(config.notifyOrderConfirmedEmail);
  const [notifyOrderShippedEmail, setNotifyOrderShippedEmail] = useState(config.notifyOrderShippedEmail);
  const [notifyOrderDeliveredEmail, setNotifyOrderDeliveredEmail] = useState(config.notifyOrderDeliveredEmail);
  const [notifyOrderCancelledEmail, setNotifyOrderCancelledEmail] = useState(config.notifyOrderCancelledEmail);
  const [notifyOrderReturnedEmail, setNotifyOrderReturnedEmail] = useState(config.notifyOrderReturnedEmail);

  // Ledger Tagada
  const [notifyLedgerTagadaSms, setNotifyLedgerTagadaSms] = useState(config.notifyLedgerTagadaSms);

  // Test Dialogs
  const [testSmsOpen, setTestSmsOpen] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [testEmailOpen, setTestEmailOpen] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("");

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateShopNotificationConfigInput) =>
      notificationConfigApi.updateConfig(shopId, payload),
    onSuccess: () => {
      toast.success(t("saveSuccess"));
      setBulksmsApiKey("");
      setSmtpPass("");
      onUpdated();
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        t("saveError");
      toast.error(msg);
    },
  });

  const testSmsMutation = useMutation({
    mutationFn: (phone: string) => notificationConfigApi.testSms(shopId, phone),
    onSuccess: (res) => {
      toast.success(res.message || t("testSmsSuccess"));
      setTestSmsOpen(false);
      setTestPhone("");
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to send test SMS";
      toast.error(msg);
    },
  });

  const testEmailMutation = useMutation({
    mutationFn: (email: string) => notificationConfigApi.testEmail(shopId, email),
    onSuccess: (res) => {
      toast.success(res.message || t("testEmailSuccess"));
      setTestEmailOpen(false);
      setTestEmailAddress("");
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to send test email";
      toast.error(msg);
    },
  });

  const handleToggleSms = async (nextVal: boolean) => {
    if (nextVal) {
      const hasApiKey = Boolean(config.hasBulksmsKey || bulksmsApiKey.trim());
      const hasSenderId = Boolean(bulksmsSenderId.trim() || config.bulksmsSenderId);

      if (!hasApiKey || !hasSenderId) {
        toast.error("BulkSMSBD API Key and Sender ID are both required before enabling SMS notifications.");
        setSmsEnabled(false);
        return;
      }
    }

    setIsSavingSmsToggle(true);
    try {
      await updateMutation.mutateAsync({
        smsEnabled: nextVal,
        bulksmsSenderId: bulksmsSenderId.trim() || config.bulksmsSenderId || null,
        ...(bulksmsApiKey.trim() ? { bulksmsApiKey: bulksmsApiKey.trim() } : {}),
      });
      setSmsEnabled(nextVal);
      toast.success(nextVal ? "SMS notifications enabled" : "SMS notifications disabled");
    } catch {
      setSmsEnabled(!nextVal);
      toast.error(nextVal ? "Failed to enable SMS notifications" : "Failed to disable SMS notifications");
    } finally {
      setIsSavingSmsToggle(false);
    }
  };

  const handleToggleEmail = async (nextVal: boolean) => {
    if (nextVal) {
      const hasHost = Boolean(smtpHost.trim() || config.smtpHost);
      const hasUser = Boolean(smtpUser.trim() || config.smtpUser);
      const hasPass = Boolean(config.hasSmtpPass || smtpPass.trim());
      const hasFrom = Boolean(emailFrom.trim() || config.emailFrom);

      if (!hasHost || !hasUser || !hasPass || !hasFrom) {
        toast.error("SMTP Host, User, Password, and Sender Email are all required before enabling Email notifications.");
        setEmailEnabled(false);
        return;
      }
    }

    setIsSavingEmailToggle(true);
    try {
      await updateMutation.mutateAsync({
        emailEnabled: nextVal,
        smtpHost: smtpHost.trim() || config.smtpHost || null,
        smtpPort: Number(smtpPort) || config.smtpPort || 587,
        smtpSecure,
        smtpUser: smtpUser.trim() || config.smtpUser || null,
        emailFrom: emailFrom.trim() || config.emailFrom || null,
        ...(smtpPass.trim() ? { smtpPass: smtpPass.trim() } : {}),
      });
      setEmailEnabled(nextVal);
      toast.success(nextVal ? "Email notifications enabled" : "Email notifications disabled");
    } catch {
      setEmailEnabled(!nextVal);
      toast.error(nextVal ? "Failed to enable Email notifications" : "Failed to disable Email notifications");
    } finally {
      setIsSavingEmailToggle(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: UpdateShopNotificationConfigInput = {
      smsEnabled,
      bulksmsSenderId: bulksmsSenderId.trim() || null,
      emailEnabled,
      smtpHost: smtpHost.trim() || null,
      smtpPort: Number(smtpPort) || 587,
      smtpSecure,
      smtpUser: smtpUser.trim() || null,
      emailFrom: emailFrom.trim() || null,

      notifyOrderCreatedSms,
      notifyOrderConfirmedSms,
      notifyOrderShippedSms,
      notifyOrderDeliveredSms,
      notifyOrderCancelledSms,
      notifyOrderReturnedSms,

      notifyOrderCreatedEmail,
      notifyOrderConfirmedEmail,
      notifyOrderShippedEmail,
      notifyOrderDeliveredEmail,
      notifyOrderCancelledEmail,
      notifyOrderReturnedEmail,

      notifyLedgerTagadaSms,
    };

    if (bulksmsApiKey.trim()) {
      payload.bulksmsApiKey = bulksmsApiKey.trim();
    }
    if (smtpPass.trim()) {
      payload.smtpPass = smtpPass.trim();
    }

    updateMutation.mutate(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Overview Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* BulkSMSBD Summary */}
        <div className="rounded-xl border bg-card/60 p-4 shadow-2xs backdrop-blur-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <MessageSquare className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">BulkSMSBD Gateway</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    config.smsEnabled
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {config.smsEnabled ? "Active" : "Disabled"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {config.hasBulksmsKey
                  ? `Key: ${config.bulksmsApiKeyMasked} · Sender: ${config.bulksmsSenderId || "N/A"}`
                  : "No credentials saved yet"}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 px-2 py-1 rounded-md">
            Direct Merchant Gateway
          </span>
        </div>

        {/* SMTP Summary */}
        <div className="rounded-xl border bg-card/60 p-4 shadow-2xs backdrop-blur-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Mail className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Custom SMTP Gateway</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    config.emailEnabled
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {config.emailEnabled ? "Active" : "Disabled"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {config.hasSmtpPass
                  ? `Host: ${config.smtpHost || "N/A"}:${config.smtpPort}`
                  : "No credentials saved yet"}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-500/5 px-2 py-1 rounded-md">
            Personal Mail Server
          </span>
        </div>
      </div>

      {/* 1. SMS Gateway Card */}
      <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <MessageSquare className="size-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{t("smsGateway")}</h3>
              <p className="text-xs text-muted-foreground">{t("smsGatewayDesc")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {config.hasBulksmsKey && (
              <button
                type="button"
                onClick={() => setTestSmsOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors"
              >
                <Send className="size-3.5" />
                <span>{t("testSms")}</span>
              </button>
            )}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={smsEnabled}
                disabled={isSavingSmsToggle || updateMutation.isPending}
                onChange={(e) => void handleToggleSms(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-disabled:opacity-50"></div>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">
              {t("senderId")}
            </label>
            <input
              type="text"
              value={bulksmsSenderId}
              onChange={(e) => setBulksmsSenderId(e.target.value)}
              placeholder={t("senderIdPlaceholder")}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              {t("apiKey")}
            </label>
            <input
              type="password"
              value={bulksmsApiKey}
              onChange={(e) => setBulksmsApiKey(e.target.value)}
              placeholder={
                config.bulksmsApiKeyMasked
                  ? `${config.bulksmsApiKeyMasked} (Saved)`
                  : t("apiKeyPlaceholder")
              }
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>
      </div>

      {/* 2. Email Gateway Card */}
      <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Mail className="size-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{t("emailGateway")}</h3>
              <p className="text-xs text-muted-foreground">{t("emailGatewayDesc")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {config.hasSmtpPass && (
              <button
                type="button"
                onClick={() => setTestEmailOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors"
              >
                <Send className="size-3.5" />
                <span>{t("testEmail")}</span>
              </button>
            )}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailEnabled}
                disabled={isSavingEmailToggle || updateMutation.isPending}
                onChange={(e) => void handleToggleEmail(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-disabled:opacity-50"></div>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold mb-1">
              {t("smtpHost")}
            </label>
            <input
              type="text"
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
              placeholder={t("smtpHostPlaceholder")}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              {t("smtpPort")}
            </label>
            <input
              type="number"
              value={smtpPort}
              onChange={(e) => setSmtpPort(Number(e.target.value))}
              placeholder={t("smtpPortPlaceholder")}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              {t("smtpUser")}
            </label>
            <input
              type="text"
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
              placeholder={t("smtpUserPlaceholder")}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              {t("smtpPass")}
            </label>
            <input
              type="password"
              value={smtpPass}
              onChange={(e) => setSmtpPass(e.target.value)}
              placeholder={
                config.smtpPassMasked
                  ? `${config.smtpPassMasked} (Saved)`
                  : t("smtpPassPlaceholder")
              }
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              {t("emailFrom")}
            </label>
            <input
              type="text"
              value={emailFrom}
              onChange={(e) => setEmailFrom(e.target.value)}
              placeholder={t("emailFromPlaceholder")}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="smtpSecureCheckbox"
            checked={smtpSecure}
            onChange={(e) => setSmtpSecure(e.target.checked)}
            className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="smtpSecureCheckbox" className="text-xs text-muted-foreground cursor-pointer">
            {t("smtpSecure")}
          </label>
        </div>
      </div>

      {/* 3. Event Triggers Matrix */}
      <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-semibold">{t("triggersTitle")}</h3>
          <p className="text-xs text-muted-foreground mt-1">{t("triggersDesc")}</p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase text-muted-foreground bg-muted/40">
                <th className="py-3 px-4 font-semibold">{t("orderEvents")}</th>
                <th className="py-3 px-4 font-semibold text-center w-28">{t("smsCol")}</th>
                <th className="py-3 px-4 font-semibold text-center w-28">{t("emailCol")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr className="hover:bg-muted/10 transition-colors">
                <td className="py-3 px-4 font-medium">{t("orderPlaced")}</td>
                <td className="py-3 px-4 text-center">
                  <input
                    type="checkbox"
                    checked={notifyOrderCreatedSms}
                    onChange={(e) => setNotifyOrderCreatedSms(e.target.checked)}
                    className="size-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </td>
                <td className="py-3 px-4 text-center">
                  <input
                    type="checkbox"
                    checked={notifyOrderCreatedEmail}
                    onChange={(e) => setNotifyOrderCreatedEmail(e.target.checked)}
                    className="size-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </td>
              </tr>

              <tr className="hover:bg-muted/10 transition-colors">
                <td className="py-3 px-4 font-medium">{t("orderConfirmed")}</td>
                <td className="py-3 px-4 text-center">
                  <input
                    type="checkbox"
                    checked={notifyOrderConfirmedSms}
                    onChange={(e) => setNotifyOrderConfirmedSms(e.target.checked)}
                    className="size-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </td>
                <td className="py-3 px-4 text-center">
                  <input
                    type="checkbox"
                    checked={notifyOrderConfirmedEmail}
                    onChange={(e) => setNotifyOrderConfirmedEmail(e.target.checked)}
                    className="size-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </td>
              </tr>

              <tr className="hover:bg-muted/10 transition-colors">
                <td className="py-3 px-4 font-medium">{t("orderShipped")}</td>
                <td className="py-3 px-4 text-center">
                  <input
                    type="checkbox"
                    checked={notifyOrderShippedSms}
                    onChange={(e) => setNotifyOrderShippedSms(e.target.checked)}
                    className="size-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </td>
                <td className="py-3 px-4 text-center">
                  <input
                    type="checkbox"
                    checked={notifyOrderShippedEmail}
                    onChange={(e) => setNotifyOrderShippedEmail(e.target.checked)}
                    className="size-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </td>
              </tr>

              <tr className="hover:bg-muted/10 transition-colors">
                <td className="py-3 px-4 font-medium">{t("orderDelivered")}</td>
                <td className="py-3 px-4 text-center">
                  <input
                    type="checkbox"
                    checked={notifyOrderDeliveredSms}
                    onChange={(e) => setNotifyOrderDeliveredSms(e.target.checked)}
                    className="size-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </td>
                <td className="py-3 px-4 text-center">
                  <input
                    type="checkbox"
                    checked={notifyOrderDeliveredEmail}
                    onChange={(e) => setNotifyOrderDeliveredEmail(e.target.checked)}
                    className="size-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </td>
              </tr>

              <tr className="hover:bg-muted/10 transition-colors">
                <td className="py-3 px-4 font-medium">{t("orderCancelled")}</td>
                <td className="py-3 px-4 text-center">
                  <input
                    type="checkbox"
                    checked={notifyOrderCancelledSms}
                    onChange={(e) => setNotifyOrderCancelledSms(e.target.checked)}
                    className="size-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </td>
                <td className="py-3 px-4 text-center">
                  <input
                    type="checkbox"
                    checked={notifyOrderCancelledEmail}
                    onChange={(e) => setNotifyOrderCancelledEmail(e.target.checked)}
                    className="size-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </td>
              </tr>

              <tr className="hover:bg-muted/10 transition-colors">
                <td className="py-3 px-4 font-medium">{t("orderReturned")}</td>
                <td className="py-3 px-4 text-center">
                  <input
                    type="checkbox"
                    checked={notifyOrderReturnedSms}
                    onChange={(e) => setNotifyOrderReturnedSms(e.target.checked)}
                    className="size-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </td>
                <td className="py-3 px-4 text-center">
                  <input
                    type="checkbox"
                    checked={notifyOrderReturnedEmail}
                    onChange={(e) => setNotifyOrderReturnedEmail(e.target.checked)}
                    className="size-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </td>
              </tr>

              {/* Ledger Tagada row */}
              <tr className="bg-muted/20 hover:bg-muted/30 transition-colors">
                <td className="py-3 px-4 font-medium">
                  <div>
                    <span>{t("ledgerTagada")}</span>
                    <p className="text-xs text-muted-foreground">{t("ledgerTagadaDesc")}</p>
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <input
                    type="checkbox"
                    checked={notifyLedgerTagadaSms}
                    onChange={(e) => setNotifyLedgerTagadaSms(e.target.checked)}
                    className="size-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </td>
                <td className="py-3 px-4 text-center text-xs text-muted-foreground font-mono">
                  —
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {updateMutation.isPending ? t("saving") : t("saveChanges")}
        </button>
      </div>

      {/* Test SMS Modal */}
      {testSmsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl space-y-4">
            <h4 className="text-base font-semibold">{t("testSmsModalTitle")}</h4>
            <div>
              <label className="block text-xs font-semibold mb-1">{t("testPhoneLabel")}</label>
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder={t("testPhonePlaceholder")}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTestSmsOpen(false)}
                className="rounded-lg border px-4 py-2 text-xs font-medium hover:bg-muted"
              >
                {t("close")}
              </button>
              <button
                type="button"
                disabled={testSmsMutation.isPending || !testPhone.trim()}
                onClick={() => testSmsMutation.mutate(testPhone.trim())}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
              >
                {testSmsMutation.isPending ? t("sending") : t("testSms")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Email Modal */}
      {testEmailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl space-y-4">
            <h4 className="text-base font-semibold">{t("testEmailModalTitle")}</h4>
            <div>
              <label className="block text-xs font-semibold mb-1">{t("testEmailLabel")}</label>
              <input
                type="email"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder={t("testEmailPlaceholder")}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTestEmailOpen(false)}
                className="rounded-lg border px-4 py-2 text-xs font-medium hover:bg-muted"
              >
                {t("close")}
              </button>
              <button
                type="button"
                disabled={testEmailMutation.isPending || !testEmailAddress.trim()}
                onClick={() => testEmailMutation.mutate(testEmailAddress.trim())}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
              >
                {testEmailMutation.isPending ? t("sending") : t("testEmail")}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

function ManualDispatchCard({
  shopId,
  config,
  onSent,
}: {
  shopId: string;
  config: ShopNotificationConfigDTO;
  onSent: () => void;
}) {
  const t = useTranslations("smsEmail");

  const [channel, setChannel] = useState<"SMS" | "EMAIL">("SMS");
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const manualSendMutation = useMutation({
    mutationFn: (payload: SendManualInput) =>
      notificationConfigApi.sendManual(shopId, payload),
    onSuccess: (res) => {
      toast.success(res.message || t("manualSuccess"));
      setRecipient("");
      setSubject("");
      setMessage("");
      onSent();
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to send manual notification";
      toast.error(msg);
    },
  });

  const handleManualSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || !message.trim()) return;

    manualSendMutation.mutate({
      channel,
      recipient: recipient.trim(),
      message: message.trim(),
      subject: channel === "EMAIL" ? subject.trim() || undefined : undefined,
    });
  };

  const isConfigured =
    channel === "SMS"
      ? config.smsEnabled && config.hasBulksmsKey
      : config.emailEnabled && config.hasSmtpPass;

  // Approximate SMS counter
  const charLength = message.length;
  const isUnicode = /[^\u0000-\u00ff]/.test(message);
  const segmentLimit = isUnicode ? 70 : 160;
  const segmentCount = charLength === 0 ? 0 : Math.ceil(charLength / segmentLimit);

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Zap className="size-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{t("manualTitle")}</h3>
            <p className="text-xs text-muted-foreground">{t("manualDesc")}</p>
          </div>
        </div>

        {/* Channel Selection Toggle */}
        <div className="flex items-center p-1 rounded-xl border bg-muted/30">
          <button
            type="button"
            onClick={() => {
              setChannel("SMS");
              setRecipient("");
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              channel === "SMS"
                ? "bg-card text-foreground shadow-xs border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="size-3.5" />
            <span>SMS</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setChannel("EMAIL");
              setRecipient("");
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              channel === "EMAIL"
                ? "bg-card text-foreground shadow-xs border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Mail className="size-3.5" />
            <span>Email</span>
          </button>
        </div>
      </div>

      {!isConfigured && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-700 dark:text-amber-400">
          <Info className="size-4 shrink-0 mt-0.5" />
          <span>
            {channel === "SMS"
              ? "BulkSMSBD gateway is currently disabled or missing credentials above. Please configure and enable it before sending SMS."
              : "Custom SMTP gateway is currently disabled or missing credentials above. Please configure and enable it before sending emails."}
          </span>
        </div>
      )}

      <form onSubmit={handleManualSend} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">
              {channel === "SMS" ? t("manualRecipientPhone") : t("manualRecipientEmail")}
            </label>
            <input
              type={channel === "SMS" ? "text" : "email"}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder={channel === "SMS" ? "01XXXXXXXXX" : "customer@example.com"}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              required
            />
          </div>

          {channel === "EMAIL" && (
            <div>
              <label className="block text-xs font-semibold mb-1">
                {t("manualSubject")}
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t("manualSubjectPlaceholder")}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold">{t("manualMessage")}</label>
            {channel === "SMS" && (
              <span className="text-[11px] text-muted-foreground font-mono">
                {t("smsChars", { chars: charLength, segments: segmentCount })}
              </span>
            )}
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder={t("manualMessagePlaceholder")}
            className="w-full rounded-lg border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={
              manualSendMutation.isPending ||
              !recipient.trim() ||
              !message.trim() ||
              !isConfigured
            }
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Send className="size-3.5" />
            <span>{manualSendMutation.isPending ? t("manualSending") : t("manualSendBtn")}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

function LogsTab({ shopId }: { shopId: string }) {
  const t = useTranslations("smsEmail");
  const [page, setPage] = useState(1);
  const [channelFilter, setChannelFilter] = useState<"ALL" | "SMS" | "EMAIL">("ALL");

  const logsQuery = useQuery({
    queryKey: ["notificationLogs", shopId, page, channelFilter],
    queryFn: () =>
      notificationConfigApi.getLogs(shopId, {
        page,
        limit: 15,
        channel: channelFilter === "ALL" ? undefined : channelFilter,
      }),
    enabled: Boolean(shopId),
  });

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b">
        <div>
          <h3 className="text-base font-semibold">{t("logsTitle")}</h3>
          <p className="text-xs text-muted-foreground">{t("logsDesc")}</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={channelFilter}
            onChange={(e) => {
              setChannelFilter(e.target.value as "ALL" | "SMS" | "EMAIL");
              setPage(1);
            }}
            className="rounded-lg border bg-background px-2.5 py-1.5 text-xs font-medium focus:outline-none"
          >
            <option value="ALL">All Channels</option>
            <option value="SMS">SMS Only</option>
            <option value="EMAIL">Email Only</option>
          </select>
          <button
            type="button"
            onClick={() => void logsQuery.refetch()}
            className="p-1.5 rounded-lg border hover:bg-muted text-muted-foreground transition-colors"
          >
            <RefreshCw className="size-4" />
          </button>
        </div>
      </div>

      {logsQuery.isPending ? (
        <CardListSkeleton rows={3} />
      ) : !logsQuery.data?.data?.length ? (
        <EmptyState title={t("noLogs")} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b uppercase text-muted-foreground bg-muted/30">
                <th className="py-2.5 px-3 font-semibold">Channel</th>
                <th className="py-2.5 px-3 font-semibold">{t("event")}</th>
                <th className="py-2.5 px-3 font-semibold">{t("recipient")}</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold">Details / Error</th>
                <th className="py-2.5 px-3 font-semibold">{t("time")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {logsQuery.data.data.map((log) => (
                <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.channel === "SMS"
                          ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                          : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {log.channel}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-medium">{log.event}</td>
                  <td className="py-3 px-3 font-mono text-[11px]">{log.recipient}</td>
                  <td className="py-3 px-3">
                    {log.status === "SENT" ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="size-3.5" />
                        <span>{t("statusSent")}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                        <XCircle className="size-3.5" />
                        <span>{t("statusFailed")}</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-muted-foreground truncate max-w-xs">
                    {log.error || log.providerRef || "—"}
                  </td>
                  <td className="py-3 px-3 text-muted-foreground whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
