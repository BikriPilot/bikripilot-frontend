"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Activity,
  ArrowDownToLine,
  ArrowLeft,
  Check,
  ExternalLink,
  Eye,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  UserRoundX,
  X,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/common/PageHeader";
import { ErrorState } from "@/components/common/PageStates";
import { AuditLogTable } from "@/components/settings/AuditLogTable";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { adminApi } from "@/lib/api/admin.api";
import { enterImpersonation as startImpersonation } from "@/lib/api/client";
import { formatMoney } from "@/lib/money";
import { useAuthStore } from "@/stores/authStore";
import { AiPricingSettingEditor } from "./AiPricingSettingEditor";
import type {
  AdminAnnouncementDTO,
  AdminAiUsageRowDTO,
  AdminContentDTO,
  AdminFeatureDTO,
  AdminInvoiceDTO,
  AdminOrderDTO,
  AdminOrderListItemDTO,
  AdminPage,
  AdminPaymentDTO,
  AdminPlanDTO,
  AdminSettingDTO,
  AdminShopDetailDTO,
  AdminShopListItemDTO,
  AdminUsageRowDTO,
  AdminUserDTO,
  AuditLogDTO,
  CouponDTO,
  JobQueueStatsDTO,
  PageViewDTO,
  VisitorIpRowDTO,
  VisitorSummaryDTO,
  WebhookEventDTO,
} from "@/types/admin";
import {
  AdminDialog,
  AdminPageLoading,
  AdminSearch,
  AdminStat,
  AdminTable,
  type AdminColumn,
  type AdminField,
} from "./AdminWidgets";

export type AdminScreen =
  | "overview"
  | "shops"
  | "shopDetail"
  | "users"
  | "orders"
  | "orderDetail"
  | "visitors"
  | "plans"
  | "planDetail"
  | "features"
  | "payments"
  | "coupons"
  | "announcements"
  | "content"
  | "settings"
  | "auditLogs"
  | "system"
  | "usage"
  | "shopAudit";

type Row = Record<string, unknown>;
type DialogState = { action: string; row: Row | null };
const rows = <T,>(value: unknown): T[] =>
  Array.isArray(value) ? (value as T[]) : [];
const pageRows = <T,>(value: unknown): AdminPage<T> =>
  value &&
  typeof value === "object" &&
  Array.isArray((value as AdminPage<T>).items)
    ? (value as AdminPage<T>)
    : { items: [] };
const string = (value: unknown) =>
  value == null || value === "" ? "—" : String(value);
const date = (value: unknown) =>
  value
    ? new Date(String(value)).toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";
const money = (value: unknown) =>
  typeof value === "number" ? formatMoney(value) : "—";
const input = (
  key: string,
  label: string,
  type: AdminField["type"] = "text",
  required = false,
  initialValue?: unknown,
): AdminField => ({ key, label, type, required, initialValue });

function ActionButton({
  children,
  onClick,
  danger = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-9 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium hover:bg-muted ${danger ? "border-danger/40 text-danger" : ""}`}
    >
      {children}
    </button>
  );
}

function LabelValue({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="min-w-0 border-b py-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 wrap-break-word text-sm">{value}</dd>
    </div>
  );
}

function PlanFeatureEditor({
  plan,
  canWrite,
  onSave,
  t,
}: {
  plan: AdminPlanDTO;
  canWrite: boolean;
  onSave: (features: AdminPlanDTO["features"]) => Promise<void>;
  t: ReturnType<typeof useTranslations>;
}) {
  const [features, setFeatures] = useState(plan.features);
  const [saving, setSaving] = useState(false);
  const update = (
    key: string,
    patch: Partial<AdminPlanDTO["features"][number]>,
  ) =>
    setFeatures((current) =>
      current.map((feature) =>
        feature.featureKey === key ? { ...feature, ...patch } : feature,
      ),
    );
  const save = async () => {
    if (
      !window.confirm(
        t("confirmations.planAffects", { count: plan.subscriberCount }),
      )
    )
      return;
    setSaving(true);
    try {
      await onSave(features);
    } finally {
      setSaving(false);
    }
  };
  return (
    <section className="space-y-3 border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">{t("planGrid.title")}</h2>
          <p className="text-xs text-muted-foreground">
            {t("planGrid.affects", { count: plan.subscriberCount })}
          </p>
        </div>
        {canWrite ? (
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="min-h-10 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {saving ? t("actions.saving") : t("actions.save")}
          </button>
        ) : null}
      </div>
      <div className="divide-y">
        {features.map((feature) => (
          <div
            key={feature.featureKey}
            className="grid gap-2 py-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"
          >
            <div className="min-w-0">
              <p className="break-all text-sm font-medium">
                {feature.featureKey}
              </p>
              <p className="text-xs text-muted-foreground">
                {feature.enabled
                  ? t("planGrid.enabled")
                  : t("planGrid.disabled")}
              </p>
            </div>
            <label className="flex min-h-10 items-center gap-2 text-sm">
              <input
                type="checkbox"
                disabled={!canWrite}
                checked={feature.enabled}
                onChange={(event) =>
                  update(feature.featureKey, { enabled: event.target.checked })
                }
                className="size-4 accent-primary"
              />
              {t("planGrid.inPlan")}
            </label>
            {feature.enabled && feature.limit !== null ? (
              <input
                aria-label={t("planGrid.limitFor", {
                  feature: feature.featureKey,
                })}
                disabled={!canWrite || feature.unlimited}
                type="number"
                min={0}
                value={feature.limit}
                onChange={(event) =>
                  update(feature.featureKey, {
                    limit: Number(event.target.value),
                  })
                }
                className="min-h-10 w-28 rounded-md border bg-background px-2 text-sm"
              />
            ) : null}
            {feature.enabled ? (
              <label className="flex min-h-10 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  disabled={!canWrite}
                  checked={feature.unlimited}
                  onChange={(event) =>
                    update(feature.featureKey, {
                      unlimited: event.target.checked,
                      limit: event.target.checked ? null : (feature.limit ?? 0),
                    })
                  }
                  className="size-4 accent-primary"
                />
                {t("planGrid.unlimited")}
              </label>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export function AdminWorkspace({
  screen,
  id,
}: {
  screen: AdminScreen;
  id?: string;
}) {
  const router = useRouter();
  const t = useTranslations("admin");
  const currentUser = useAuthStore((state) => state.user);
  const canWrite = currentUser?.platformRole === "SUPER_ADMIN";
  const { shopId: currentShopId } = useCurrentShop();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState(
    screen === "payments"
      ? "pending"
      : screen === "content"
        ? "FAQ"
        : screen === "settings"
          ? "platform"
          : "usage",
  );
  const [range, setRange] = useState("7");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [settingOverrides, setSettingDraft] = useState<Record<string, unknown>>(
    {},
  );
  const [featureFilter, setFeatureFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState(
    new Date().toISOString().slice(0, 7),
  );

  const query = useQuery({
    queryKey: [
      "admin-page",
      screen,
      id,
      currentShopId,
      search,
      page,
      tab,
      range,
      from,
      to,
      featureFilter,
      periodFilter,
    ],
    queryFn: async (): Promise<unknown> => {
      const params = { page, limit: 25, search: search || undefined };
      switch (screen) {
        case "overview":
          return adminApi.overview();
        case "shops":
          return adminApi.shops(params);
        case "shopDetail":
          return Promise.all([adminApi.shop(id!), adminApi.shopOverrides(id!)]);
        case "users":
          return adminApi.users(params);
        case "orders":
          return adminApi.orders(params);
        case "orderDetail":
          return adminApi.order(id!);
        case "visitors": {
          const end = to || new Date().toISOString().slice(0, 10);
          const start =
            from ||
            new Date(Date.now() - (Number(range) - 1) * 86_400_000)
              .toISOString()
              .slice(0, 10);
          return Promise.all([
            adminApi.visitorSummary({ from: start, to: end }),
            adminApi.visitorIps({ from: start, to: end, page, limit: 25 }),
            adminApi.visitorRecent({ page: 1, limit: 15 }),
          ]);
        }
        case "plans":
          return adminApi.plans();
        case "planDetail":
          return Promise.all([adminApi.plan(id!), adminApi.features()]);
        case "features":
          return adminApi.features();
        case "payments":
          return tab === "invoices"
            ? adminApi.invoices(params)
            : adminApi.payments({
                ...params,
                status:
                  tab === "pending"
                    ? "PENDING_VERIFICATION"
                    : tab === "refunds"
                      ? "PAID"
                      : undefined,
              });
        case "coupons":
          return adminApi.coupons();
        case "announcements":
          return adminApi.announcements();
        case "content":
          return adminApi.content({ type: tab });
        case "settings":
          return adminApi.settings();
        case "auditLogs":
          return adminApi.auditLogs({ ...params, action: search || undefined });
        case "shopAudit":
          return currentShopId
            ? adminApi.shopAuditLogs(currentShopId, { page, limit: 25 })
            : { items: [] };
        case "system":
          return Promise.all([adminApi.webhooks(params), adminApi.jobs()]);
        case "usage":
          return tab === "ai"
            ? adminApi.aiUsage({
                ...params,
                from: from || undefined,
                to: to || undefined,
              })
            : adminApi.usage({
                ...params,
                featureKey: featureFilter || undefined,
                period: periodFilter,
              });
      }
    },
  });

  const pageTitle = t(`pages.${screen}.title`);
  const pageDescription = t(`pages.${screen}.description`);
  const setPageNumber = (value: number) => setPage(Math.max(1, value));
  const refresh = () => void query.refetch();
  const notifyAction = async (
    task: () => Promise<unknown>,
    successKey = "saved",
  ): Promise<boolean> => {
    setBusy(true);
    setDialogError(null);
    try {
      await task();
      toast.success(t(`messages.${successKey}`));
      setDialog(null);
      await query.refetch();
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("messages.actionFailed");
      setDialogError(message);
      toast.error(message || t("messages.actionFailed"));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const openDialog = (action: string, selected: Row | null = null) => {
    setDialogError(null);
    setDialog({ action, row: selected });
  };

  const actionFields = (): AdminField[] => {
    const selected = dialog?.row ?? {};
    switch (dialog?.action) {
      case "user.block":
        return [
          input("reason", t("fields.reason"), "textarea", true),
          {
            ...input(
              "suspendOwnedShops",
              t("fields.suspendOwnedShops"),
              "boolean",
              false,
              true,
            ),
          },
        ];
      case "user.unblock":
        return [
          input(
            "reactivateOwnedShops",
            t("fields.reactivateOwnedShops"),
            "boolean",
            false,
            true,
          ),
        ];
      case "user.reset2fa":
        return [input("reason", t("fields.reason"), "textarea", true)];
      case "payment.approve":
        return [input("note", t("fields.note"), "textarea")];
      case "payment.reject":
        return [input("reason", t("fields.reason"), "textarea", true)];
      case "shop.status":
        return [
          input(
            "status",
            t("fields.status"),
            "select",
            true,
            selected.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE",
          ),
          input(
            "reason",
            t("fields.reason"),
            "text",
            selected.status === "ACTIVE",
          ),
        ];
      case "shop.impersonate":
        return [input("reason", t("fields.reason"), "textarea", true)];
      case "shop.extend":
        return [input("days", t("fields.days"), "number", true, 30)];
      case "shop.delete":
        return [input("confirmSlug", t("fields.confirmSlug"), "text", true)];
      case "shop.override":
        return [
          { ...input("featureKey", t("fields.featureKey"), "text", true) },
          input("enabled", t("fields.enabledOverride"), "boolean"),
          input("limit", t("fields.limit"), "number"),
          input("unlimited", t("fields.unlimited"), "boolean"),
          input("reason", t("fields.reason"), "textarea", true),
          input("expiresAt", t("fields.expiresAt"), "date"),
        ];
      case "plan.create":
        return [
          input("key", t("fields.planKey"), "text", true),
          input("nameEn", t("fields.nameEn"), "text", true),
          input("nameBn", t("fields.nameBn")),
          input(
            "priceMonthlyTaka",
            t("fields.monthlyPriceTaka"),
            "number",
            true,
            0,
          ),
          input(
            "priceYearlyTaka",
            t("fields.yearlyPriceTaka"),
            "number",
            true,
            0,
          ),
          input("trialDays", t("fields.trialDays"), "number", false, 0),
          input("isPublic", t("fields.publicPlan"), "boolean", false, true),
        ];
      case "plan.edit":
        return [
          input("nameEn", t("fields.nameEn"), "text", true, selected.nameEn),
          input("nameBn", t("fields.nameBn"), "text", false, selected.nameBn),
          input(
            "priceMonthlyTaka",
            t("fields.monthlyPriceTaka"),
            "number",
            true,
            Number(selected.priceMonthlyPaisa ?? 0) / 100,
          ),
          input(
            "priceYearlyTaka",
            t("fields.yearlyPriceTaka"),
            "number",
            true,
            Number(selected.priceYearlyPaisa ?? 0) / 100,
          ),
          input(
            "trialDays",
            t("fields.trialDays"),
            "number",
            false,
            selected.trialDays,
          ),
          input(
            "isPublic",
            t("fields.publicPlan"),
            "boolean",
            false,
            selected.isPublic,
          ),
          input(
            "isDefault",
            t("fields.defaultPlan"),
            "boolean",
            false,
            selected.isDefault,
          ),
          input(
            "isArchived",
            t("fields.archived"),
            "boolean",
            false,
            selected.isArchived,
          ),
        ];
      case "coupon.create":
      case "coupon.edit":
        return [
          input("code", t("fields.code"), "text", true, selected.code),
          {
            ...input(
              "type",
              t("fields.couponType"),
              "select",
              true,
              selected.type ?? "PERCENT",
            ),
            options: [
              { value: "PERCENT", label: t("couponTypes.PERCENT") },
              { value: "FIXED", label: t("couponTypes.FIXED") },
            ],
          },
          input(
            "value",
            t("fields.value"),
            "number",
            true,
            selected.value ?? 10,
          ),
          input(
            "maxRedemptions",
            t("fields.maxRedemptions"),
            "number",
            false,
            selected.maxRedemptions,
          ),
          input(
            "validFrom",
            t("fields.validFrom"),
            "date",
            false,
            selected.validFrom ? String(selected.validFrom).slice(0, 10) : "",
          ),
          input(
            "validUntil",
            t("fields.validUntil"),
            "date",
            false,
            selected.validUntil ? String(selected.validUntil).slice(0, 10) : "",
          ),
          input(
            "planKeys",
            t("fields.planKeys"),
            "text",
            false,
            Array.isArray(selected.planKeys) ? selected.planKeys.join(",") : "",
          ),
          input(
            "billingCycles",
            t("fields.billingCycles"),
            "text",
            false,
            Array.isArray(selected.billingCycles)
              ? selected.billingCycles.join(",")
              : "",
          ),
          input(
            "isActive",
            t("fields.active"),
            "boolean",
            false,
            selected.isActive ?? true,
          ),
        ];
      case "announcement.create":
      case "announcement.edit":
        return [
          input("titleEn", t("fields.titleEn"), "text", true, selected.titleEn),
          input(
            "titleBn",
            t("fields.titleBn"),
            "text",
            false,
            selected.titleBn,
          ),
          input(
            "bodyEn",
            t("fields.bodyEn"),
            "textarea",
            true,
            selected.bodyEn,
          ),
          input(
            "bodyBn",
            t("fields.bodyBn"),
            "textarea",
            false,
            selected.bodyBn,
          ),
          {
            ...input(
              "variant",
              t("fields.variant"),
              "select",
              true,
              selected.variant ?? "INFO",
            ),
            options: ["INFO", "WARNING", "SUCCESS"].map((value) => ({
              value,
              label: t(`variants.${value}`),
            })),
          },
          {
            ...input(
              "audience",
              t("fields.audience"),
              "select",
              true,
              selected.audience ?? "ALL",
            ),
            options: ["ALL", "PLAN", "SHOP"].map((value) => ({
              value,
              label: t(`audiences.${value}`),
            })),
          },
          input(
            "planKey",
            t("fields.planKey"),
            "text",
            false,
            selected.planKey,
          ),
          input("shopId", t("fields.shopId"), "text", false, selected.shopId),
          input(
            "linkUrl",
            t("fields.linkUrl"),
            "text",
            false,
            selected.linkUrl,
          ),
          input(
            "startsAt",
            t("fields.startsAt"),
            "date",
            true,
            selected.startsAt
              ? String(selected.startsAt).slice(0, 10)
              : new Date().toISOString().slice(0, 10),
          ),
          input(
            "endsAt",
            t("fields.endsAt"),
            "date",
            false,
            selected.endsAt ? String(selected.endsAt).slice(0, 10) : "",
          ),
          input(
            "isDismissible",
            t("fields.dismissible"),
            "boolean",
            false,
            selected.isDismissible ?? true,
          ),
          input(
            "isActive",
            t("fields.active"),
            "boolean",
            false,
            selected.isActive ?? true,
          ),
        ];
      case "content.create":
      case "content.edit":
        return [
          {
            ...input(
              "type",
              t("fields.contentType"),
              "select",
              true,
              selected.type ?? tab,
            ),
            options: ["FAQ", "TESTIMONIAL"].map((value) => ({
              value,
              label: t(`contentTypes.${value}`),
            })),
          },
          input("titleEn", t("fields.titleEn"), "text", true, selected.titleEn),
          input(
            "titleBn",
            t("fields.titleBn"),
            "text",
            false,
            selected.titleBn,
          ),
          input(
            "bodyEn",
            t("fields.bodyEn"),
            "textarea",
            true,
            selected.bodyEn,
          ),
          input(
            "bodyBn",
            t("fields.bodyBn"),
            "textarea",
            false,
            selected.bodyBn,
          ),
          input(
            "authorName",
            t("fields.authorName"),
            "text",
            false,
            selected.authorName,
          ),
          input(
            "authorRole",
            t("fields.authorRole"),
            "text",
            false,
            selected.authorRole,
          ),
          input(
            "avatarUrl",
            t("fields.avatarUrl"),
            "text",
            false,
            selected.avatarUrl,
          ),
          input("rating", t("fields.rating"), "number", false, selected.rating),
          input(
            "sortOrder",
            t("fields.sortOrder"),
            "number",
            false,
            selected.sortOrder ?? 0,
          ),
        ];
      default:
        return [];
    }
  };

  const submitDialog = async (values: Record<string, unknown>) => {
    if (!dialog) return;
    const selected = dialog.row ?? {};
    const idValue = String(selected.id ?? "");
    const clean = { ...values };
    if (dialog.action.startsWith("coupon.")) {
      clean.code = String(clean.code ?? "").toUpperCase();
      clean.planKeys = String(clean.planKeys ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      clean.billingCycles = String(clean.billingCycles ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      clean.maxRedemptions =
        clean.maxRedemptions === "" ? null : clean.maxRedemptions;
      clean.validFrom = clean.validFrom
        ? new Date(`${String(clean.validFrom)}T00:00:00.000Z`).toISOString()
        : null;
      clean.validUntil = clean.validUntil
        ? new Date(`${String(clean.validUntil)}T23:59:59.999Z`).toISOString()
        : null;
    }
    if (dialog.action.startsWith("announcement.")) {
      for (const key of ["endsAt"])
        clean[key] = clean[key]
          ? new Date(`${String(clean[key])}T23:59:59.999Z`).toISOString()
          : null;
      clean.startsAt = new Date(
        `${String(clean.startsAt)}T00:00:00.000Z`,
      ).toISOString();
    }
    if (dialog.action.startsWith("plan.")) {
      clean.priceMonthlyPaisa = Math.round(
        Number(clean.priceMonthlyTaka) * 100,
      );
      clean.priceYearlyPaisa = Math.round(Number(clean.priceYearlyTaka) * 100);
      delete clean.priceMonthlyTaka;
      delete clean.priceYearlyTaka;
    }
    switch (dialog.action) {
      case "user.block":
        return notifyAction(
          () => adminApi.blockUser(idValue, values),
          "blocked",
        );
      case "user.unblock":
        return notifyAction(
          () => adminApi.unblockUser(idValue, values),
          "unblocked",
        );
      case "user.reset2fa":
        return notifyAction(
          () => adminApi.reset2fa(idValue, { reason: String(values.reason) }),
          "saved",
        );
      case "payment.approve":
        return notifyAction(
          () => adminApi.approvePayment(idValue, values),
          "approved",
        );
      case "payment.reject":
        return notifyAction(
          () => adminApi.rejectPayment(idValue, values),
          "saved",
        );
      case "shop.status":
        return notifyAction(
          () => adminApi.setShopStatus(idValue, values),
          "saved",
        );
      case "shop.impersonate": {
        const result = await adminApi.impersonate(idValue, {
          reason: String(values.reason),
        });
        startImpersonation(
          result.accessToken,
          result.shopId,
          String(selected.name ?? selected.shopName ?? result.shopId),
        );
        router.push("/dashboard");
        return;
      }
      case "shop.extend":
        return notifyAction(
          () => adminApi.extendShop(idValue, { days: Number(values.days) }),
          "saved",
        );
      case "shop.delete":
        if (values.confirmSlug !== selected.slug)
          throw new Error(t("messages.slugMismatch"));
        await notifyAction(
          () =>
            adminApi.deleteShop(idValue, {
              confirmSlug: String(values.confirmSlug),
            }),
          "deleted",
        );
        router.push("/admin/shops");
        return;
      case "shop.override": {
        const body: Record<string, unknown> = { ...values };
        body.enabled = values.enabled ? true : null;
        body.limit = values.limit === "" ? null : Number(values.limit);
        body.unlimited = Boolean(values.unlimited);
        body.expiresAt = values.expiresAt
          ? new Date(`${String(values.expiresAt)}T23:59:59.999Z`).toISOString()
          : null;
        return notifyAction(
          () => adminApi.setOverride(idValue, String(values.featureKey), body),
          "saved",
        );
      }
      case "plan.create":
        return notifyAction(() => adminApi.createPlan(clean), "saved");
      case "plan.edit":
        return notifyAction(() => adminApi.updatePlan(idValue, clean), "saved");
      case "coupon.create":
        return notifyAction(() => adminApi.createCoupon(clean), "saved");
      case "coupon.edit":
        return notifyAction(
          () => adminApi.updateCoupon(idValue, clean),
          "saved",
        );
      case "announcement.create":
        return notifyAction(() => adminApi.createAnnouncement(clean), "saved");
      case "announcement.edit":
        return notifyAction(
          () => adminApi.updateAnnouncement(idValue, clean),
          "saved",
        );
      case "content.create":
        return notifyAction(() => adminApi.createContent(clean), "saved");
      case "content.edit":
        return notifyAction(
          () => adminApi.updateContent(idValue, clean),
          "saved",
        );
    }
  };

  const perform = async (action: string, selected: Row) => {
    const idValue = String(selected.id ?? "");
    if (action === "shop.open") return router.push(`/admin/shops/${idValue}`);
    if (action === "order.open") return router.push(`/admin/orders/${idValue}`);
    if (action === "plan.open") return router.push(`/admin/plans/${idValue}`);
    if (
      action === "user.block" ||
      action === "user.unblock" ||
      action === "user.reset2fa" ||
      action === "payment.approve" ||
      action === "payment.reject" ||
      action === "shop.status" ||
      action === "shop.impersonate" ||
      action === "shop.extend" ||
      action === "shop.delete" ||
      action === "shop.override" ||
      action === "plan.edit" ||
      action === "coupon.edit" ||
      action === "announcement.edit" ||
      action === "content.edit"
    )
      return openDialog(action, selected);
    if (action === "feature.toggle")
      return notifyAction(
        () =>
          adminApi.updateFeature(String(selected.key), {
            globalEnabled: !selected.globalEnabled,
          }),
        "saved",
      );
    if (
      action === "payment.recheck" &&
      window.confirm(t("confirmations.paymentRecheck"))
    )
      return notifyAction(() => adminApi.recheckPayment(idValue), "saved");
    if (
      action === "payment.refund" &&
      window.confirm(t("confirmations.markRefunded"))
    )
      return openDialog("payment.refund", selected);
    if (
      action === "coupon.delete" &&
      window.confirm(t("confirmations.deleteCoupon"))
    )
      return notifyAction(() => adminApi.deleteCoupon(idValue), "deleted");
    if (
      action === "announcement.delete" &&
      window.confirm(t("confirmations.deleteAnnouncement"))
    )
      return notifyAction(
        () => adminApi.deleteAnnouncement(idValue),
        "deleted",
      );
    if (
      action === "content.delete" &&
      window.confirm(t("confirmations.deleteContent"))
    )
      return notifyAction(() => adminApi.deleteContent(idValue), "deleted");
    if (
      action === "user.unlock" &&
      window.confirm(t("confirmations.unlockUser"))
    )
      return notifyAction(() => adminApi.unlockUser(idValue), "saved");
    if (
      action === "user.revoke" &&
      window.confirm(t("confirmations.revokeSessions"))
    )
      return notifyAction(() => adminApi.revokeSessions(idValue), "saved");
    if (action === "job.retry" && window.confirm(t("confirmations.retryJobs")))
      return notifyAction(
        () => adminApi.retryJobs(String(selected.queue)),
        "saved",
      );
    if (
      action === "webhook.replay" &&
      window.confirm(t("confirmations.replayWebhook"))
    )
      return notifyAction(() => adminApi.replayWebhook(idValue), "saved");
    if (
      action === "plan.archive" &&
      window.confirm(t("confirmations.archivePlan"))
    )
      return notifyAction(
        () => adminApi.updatePlan(idValue, { isArchived: true }),
        "saved",
      );
    if (action === "payment.refund")
      return openDialog("payment.refund", selected);
  };

  const tabs = (keys: string[]) => (
    <div
      role="tablist"
      className="flex max-w-full gap-1 overflow-x-auto border-b"
    >
      {keys.map((key) => (
        <button
          type="button"
          role="tab"
          aria-selected={tab === key}
          key={key}
          onClick={() => {
            setTab(key);
            setPage(1);
          }}
          className={`min-h-11 shrink-0 border-b-2 px-3 text-sm ${tab === key ? "border-primary font-semibold text-primary" : "border-transparent text-muted-foreground"}`}
        >
          {t(`tabs.${key}`)}
        </button>
      ))}
    </div>
  );

  const table = <T extends object>(
    values: T[],
    columns: AdminColumn<T>[],
    emptyKey = "empty.noResults",
    action?: (item: T) => React.ReactNode,
    key = (item: T) =>
      String((item as Row).id ?? (item as Row).key ?? JSON.stringify(item)),
    footerRow?: React.ReactNode,
    footerMobile?: React.ReactNode,
  ) => (
    <AdminTable
      rows={values}
      columns={columns}
      empty={t(emptyKey)}
      rowKey={key}
      rowActions={action}
      footerRow={footerRow}
      footerMobile={footerMobile}
    />
  );

  const paging = (result: AdminPage<unknown>) => (
    <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
      <span>
        {t("pagination.total", {
          count: result.meta?.total ?? result.items.length,
        })}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPageNumber(page - 1)}
          className="min-h-9 rounded-md border px-3 disabled:opacity-40"
        >
          {t("pagination.previous")}
        </button>
        <span className="grid min-h-9 place-items-center px-2">
          {t("pagination.page", { page })}
        </span>
        <button
          type="button"
          disabled={Boolean(
            result.meta?.totalPages && page >= result.meta.totalPages,
          )}
          onClick={() => setPageNumber(page + 1)}
          className="min-h-9 rounded-md border px-3 disabled:opacity-40"
        >
          {t("pagination.next")}
        </button>
      </div>
    </div>
  );

  const renderOverview = (
    data: Awaited<ReturnType<typeof adminApi.overview>>,
  ) => (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStat
          label={t("overview.totalShops")}
          value={data.shops.total}
          detail={t("overview.shopBreakdown", {
            active: data.shops.active,
            suspended: data.shops.suspended,
          })}
        />
        <AdminStat
          label={t("overview.users")}
          value={data.users.total}
          detail={t("overview.new7Days", { count: data.users.newLast7Days })}
        />
        <AdminStat
          label={t("overview.mrr")}
          value={money(data.revenue.mrrPaisa)}
          detail={t("overview.thisMonthRevenue", {
            amount: money(data.revenue.thisMonthPaisa),
          })}
        />
        <AdminStat
          label={t("overview.ordersToday")}
          value={data.activity.ordersToday}
          detail={t("overview.visitorsToday", {
            count: data.activity.visitorsToday,
          })}
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
        <section className="min-w-0 border bg-card p-4">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="font-semibold">{t("overview.signups")}</h2>
              <p className="text-xs text-muted-foreground">
                {t("overview.last30Days")}
              </p>
            </div>
            <Activity className="text-primary" size={18} />
          </div>
          <div className="h-64 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.signupsByDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} minTickGap={24} />
                <YAxis
                  allowDecimals={false}
                  width={28}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="border bg-card p-4">
          <h2 className="font-semibold">{t("overview.systemStatus")}</h2>
          <dl className="mt-3 divide-y text-sm">
            <LabelValue
              label={t("overview.failedWebhooks")}
              value={data.system.failedWebhooks24h}
            />
            <LabelValue
              label={t("overview.failedJobs")}
              value={data.system.failedJobs24h}
            />
            <LabelValue
              label={t("overview.launchMode")}
              value={
                data.system.freeLaunchMode ? t("common.on") : t("common.off")
              }
            />
            <LabelValue
              label={t("overview.maintenance")}
              value={
                data.system.maintenanceMode ? t("common.on") : t("common.off")
              }
            />
            <LabelValue
              label={t("overview.appVersion")}
              value={string(data.system.appVersion)}
            />
          </dl>
          <h3 className="mt-5 text-xs font-semibold uppercase text-muted-foreground">
            {t("overview.integrations")}
          </h3>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Object.entries(data.system.integrations).map(([name, enabled]) => (
              <div
                key={name}
                className="flex items-center justify-between gap-2 border px-2 py-1.5 text-xs"
              >
                <span className="capitalize">{name}</span>
                {enabled ? (
                  <Check className="text-success" size={14} />
                ) : (
                  <X className="text-muted-foreground" size={14} />
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="border bg-card p-4">
          <h2 className="font-semibold">{t("overview.planDistribution")}</h2>
          <div className="mt-4 space-y-3">
            {data.plans.map((plan) => {
              const max = Math.max(
                ...data.plans.map((item) => item.shopCount),
                1,
              );
              return (
                <div key={plan.planKey}>
                  <div className="mb-1 flex justify-between gap-3 text-sm">
                    <span>{plan.nameEn}</span>
                    <span className="tabular-nums">{plan.shopCount}</span>
                  </div>
                  <div className="h-2 bg-muted">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(plan.shopCount / max) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        <section className="border bg-card p-4">
          <h2 className="font-semibold">{t("overview.activity")}</h2>
          <div className="mt-3 grid grid-cols-2 gap-x-5">
            <LabelValue
              label={t("overview.ordersThisMonth")}
              value={data.orders.thisMonth}
            />
            <LabelValue
              label={t("overview.deliveredThisMonth")}
              value={data.orders.deliveredThisMonth}
            />
            <LabelValue
              label={t("overview.gmvThisMonth")}
              value={money(data.orders.gmvThisMonthPaisa)}
            />
            <LabelValue
              label={t("overview.aiCost")}
              value={`$${(data.ai.costThisMonthMicroUsd / 1_000_000).toFixed(2)}`}
            />
            <LabelValue
              label={t("overview.pendingPayments")}
              value={
                <Link href="/admin/payments" className="text-primary underline">
                  {data.pendingManualPayments}
                </Link>
              }
            />
            <LabelValue
              label={t("overview.needsRefund")}
              value={data.paymentsNeedingRefund}
            />
          </div>
        </section>
      </div>
    </div>
  );

  const renderData = () => {
    if (query.isPending) return <AdminPageLoading />;
    if (query.isError) return <ErrorState onRetry={refresh} />;
    const value = query.data;

    if (screen === "overview")
      return renderOverview(
        value as Awaited<ReturnType<typeof adminApi.overview>>,
      );
    if (screen === "shops") {
      const result = pageRows<AdminShopListItemDTO>(value);
      const columns: AdminColumn<AdminShopListItemDTO>[] = [
        {
          key: "shop",
          label: t("columns.shop"),
          value: (item) => <span className="font-medium">{item.name}</span>,
        },
        {
          key: "owner",
          label: t("columns.owner"),
          value: (item) => (
            <span>
              {item.owner.name}
              <span className="block text-xs text-muted-foreground">
                {item.owner.email}
              </span>
            </span>
          ),
        },
        {
          key: "plan",
          label: t("columns.plan"),
          value: (item) =>
            `${item.plan.nameEn} · ${t(`status.${item.subscriptionStatus}`, { fallback: item.subscriptionStatus })}`,
        },
        {
          key: "orders",
          label: t("columns.ordersThisMonth"),
          value: (item) => item.ordersThisMonth,
        },
        {
          key: "created",
          label: t("columns.created"),
          value: (item) => date(item.createdAt),
        },
      ];
      return (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <AdminSearch
              value={search}
              placeholder={t("search.shops")}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
            />
          </div>
          {table(result.items, columns, "empty.noShops", (item) => (
            <ActionButton
              onClick={() => void perform("shop.open", item as unknown as Row)}
            >
              <ExternalLink size={14} />
              {t("actions.open")}
            </ActionButton>
          ))}
          {paging(result)}
        </div>
      );
    }
    if (screen === "shopDetail")
      return renderShopDetail(
        value as [
          AdminShopDetailDTO,
          Awaited<ReturnType<typeof adminApi.shopOverrides>>,
        ],
      );
    if (screen === "users") {
      const result = pageRows<AdminUserDTO>(value);
      const columns: AdminColumn<AdminUserDTO>[] = [
        {
          key: "user",
          label: t("columns.user"),
          value: (item) => (
            <span className="font-medium">
              {item.name}
              <span className="block break-all text-xs text-muted-foreground">
                {item.email}
              </span>
            </span>
          ),
        },
        {
          key: "phone",
          label: t("columns.phone"),
          value: (item) => string(item.phone),
        },
        {
          key: "status",
          label: t("columns.status"),
          value: (item) => (
            <span
              className={
                item.status === "SUSPENDED" ? "font-semibold text-danger" : ""
              }
            >
              {t(`status.${item.status}`)}
            </span>
          ),
        },
        {
          key: "role",
          label: t("columns.role"),
          value: (item) => t(`roles.${item.platformRole}`),
        },
        {
          key: "security",
          label: t("columns.security"),
          value: (item) => (
            <span>
              {item.twoFactorEnabled
                ? t("common.enabled")
                : t("common.disabled")}
              {item.lockedUntil ? (
                <span className="block text-xs text-warning">
                  {t("columns.lockedUntil", { date: date(item.lockedUntil) })}
                </span>
              ) : null}
            </span>
          ),
        },
        {
          key: "shops",
          label: t("columns.shops"),
          value: (item) => item.memberships.length,
        },
      ];
      return (
        <div className="space-y-4">
          <AdminSearch
            value={search}
            placeholder={t("search.users")}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
          />
          {table(result.items, columns, "empty.noUsers", (item) => (
            <div className="flex flex-wrap gap-1">
              {item.status === "SUSPENDED" ? (
                <ActionButton
                  onClick={() =>
                    void perform("user.unblock", item as unknown as Row)
                  }
                >
                  <Check size={14} />
                  {t("actions.unblock")}
                </ActionButton>
              ) : canWrite ? (
                <ActionButton
                  danger
                  onClick={() =>
                    void perform("user.block", item as unknown as Row)
                  }
                >
                  <UserRoundX size={14} />
                  {t("actions.block")}
                </ActionButton>
              ) : null}
              {item.lockedUntil && canWrite ? (
                <ActionButton
                  onClick={() =>
                    void perform("user.unlock", item as unknown as Row)
                  }
                >
                  {t("actions.unlock")}
                </ActionButton>
              ) : null}
              {canWrite ? (
                <ActionButton
                  onClick={() =>
                    void perform("user.revoke", item as unknown as Row)
                  }
                >
                  {t("actions.revokeSessions")}
                </ActionButton>
              ) : null}
              {item.twoFactorEnabled && canWrite ? (
                <ActionButton
                  onClick={() =>
                    void perform("user.reset2fa", item as unknown as Row)
                  }
                >
                  <RotateCcw size={14} />
                  {t("actions.reset2fa")}
                </ActionButton>
              ) : null}
            </div>
          ))}
          {paging(result)}
        </div>
      );
    }
    if (screen === "orders") {
      const result = pageRows<AdminOrderListItemDTO>(value);
      const columns: AdminColumn<AdminOrderListItemDTO>[] = [
        {
          key: "number",
          label: t("columns.order"),
          value: (item) => (
            <span className="font-semibold">{item.orderNumber}</span>
          ),
        },
        {
          key: "shop",
          label: t("columns.shop"),
          value: (item) => item.shop.name,
        },
        {
          key: "customer",
          label: t("columns.customer"),
          value: (item) => (
            <span>
              {item.customerName}
              <span className="block text-xs text-muted-foreground">
                {item.customerPhone}
              </span>
            </span>
          ),
        },
        {
          key: "total",
          label: t("columns.total"),
          value: (item) => money(item.totalPaisa),
        },
        {
          key: "status",
          label: t("columns.status"),
          value: (item) =>
            t(`status.${item.status}`, { fallback: item.status }),
        },
        {
          key: "created",
          label: t("columns.created"),
          value: (item) => date(item.createdAt),
        },
      ];
      return (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <AdminSearch
              value={search}
              placeholder={t("search.orders")}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
            />
            <button
              type="button"
              onClick={() => void exportOrders()}
              className="inline-flex min-h-11 items-center gap-2 rounded-md border px-3 text-sm"
            >
              <ArrowDownToLine size={16} />
              {t("actions.export")}
            </button>
          </div>
          {table(result.items, columns, "empty.noOrders", (item) => (
            <ActionButton
              onClick={() => void perform("order.open", item as unknown as Row)}
            >
              <ExternalLink size={14} />
              {t("actions.view")}
            </ActionButton>
          ))}
          {paging(result)}
        </div>
      );
    }
    if (screen === "orderDetail")
      return renderOrderDetail(value as AdminOrderDTO);
    if (screen === "visitors")
      return renderVisitors(
        value as [
          VisitorSummaryDTO,
          AdminPage<VisitorIpRowDTO>,
          AdminPage<PageViewDTO>,
        ],
      );
    if (screen === "plans") return renderPlans(rows<AdminPlanDTO>(value));
    if (screen === "planDetail")
      return renderPlanDetail(value as [AdminPlanDTO, AdminFeatureDTO[]]);
    if (screen === "features")
      return renderFeatures(rows<AdminFeatureDTO>(value));
    if (screen === "payments") return renderPayments(value);
    if (screen === "coupons") return renderCoupons(rows<CouponDTO>(value));
    if (screen === "announcements")
      return renderAnnouncements(rows<AdminAnnouncementDTO>(value));
    if (screen === "content")
      return renderContent(rows<AdminContentDTO>(value));
    if (screen === "settings")
      return renderSettings(rows<AdminSettingDTO>(value));
    if (screen === "auditLogs")
      return renderAuditLogs(pageRows<AuditLogDTO>(value));
    if (screen === "shopAudit")
      return renderAuditLogs(pageRows<AuditLogDTO>(value));
    if (screen === "system")
      return renderSystem(
        value as [AdminPage<WebhookEventDTO>, JobQueueStatsDTO[]],
      );
    return renderUsage(value);
  };

  const renderShopDetail = ([shop, overrides]: [
    AdminShopDetailDTO,
    Awaited<ReturnType<typeof adminApi.shopOverrides>>,
  ]) => (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/shops"
          className="inline-flex min-h-10 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} />
          {t("actions.backToShops")}
        </Link>
        <div className="flex flex-wrap gap-2">
          {canWrite ? (
            <>
              <ActionButton
                onClick={() =>
                  void perform("shop.status", shop as unknown as Row)
                }
              >
                {shop.status === "ACTIVE"
                  ? t("actions.suspend")
                  : t("actions.reactivate")}
              </ActionButton>
              <ActionButton
                onClick={() =>
                  void perform("shop.impersonate", shop as unknown as Row)
                }
              >
                <Eye size={14} />
                {t("actions.impersonate")}
              </ActionButton>
              <ActionButton
                onClick={() =>
                  void perform("shop.extend", shop as unknown as Row)
                }
              >
                {t("actions.extend")}
              </ActionButton>
              <ActionButton
                danger
                onClick={() =>
                  void perform("shop.delete", shop as unknown as Row)
                }
              >
                {t("actions.deleteShop")}
              </ActionButton>
            </>
          ) : null}
        </div>
      </div>
      <section className="border bg-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">{shop.name}</h2>
            <p className="text-sm text-muted-foreground">
              /{shop.slug} · {shop.owner.name} · {shop.owner.email}
            </p>
          </div>
          <span
            className={`rounded-sm px-2 py-1 text-xs font-semibold ${shop.status === "SUSPENDED" ? "bg-danger-soft text-danger" : "bg-success-soft text-success"}`}
          >
            {t(`status.${shop.status}`)}
          </span>
        </div>
        <dl className="mt-4 grid gap-x-5 sm:grid-cols-2 xl:grid-cols-4">
          <LabelValue label={t("columns.plan")} value={shop.plan.nameEn} />
          <LabelValue
            label={t("columns.subscription")}
            value={shop.subscriptionStatus}
          />
          <LabelValue
            label={t("columns.periodEnd")}
            value={date(shop.currentPeriodEnd)}
          />
          <LabelValue
            label={t("columns.category")}
            value={string(shop.businessCategory)}
          />
          <LabelValue
            label={t("columns.district")}
            value={string(shop.district)}
          />
          <LabelValue label={t("columns.phone")} value={string(shop.phone)} />
          <LabelValue
            label={t("columns.website")}
            value={string(shop.websiteUrl)}
          />
          <LabelValue
            label={t("columns.facebook")}
            value={string(shop.facebookPageUrl)}
          />
        </dl>
      </section>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStat
          label={t("shopStats.products")}
          value={shop.stats.products}
        />
        <AdminStat
          label={t("shopStats.customers")}
          value={shop.stats.customers}
        />
        <AdminStat
          label={t("shopStats.orders")}
          value={shop.stats.ordersTotal}
        />
        <AdminStat
          label={t("shopStats.conversations")}
          value={shop.stats.conversations}
        />
      </div>
      <section className="border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">{t("shopDetail.overrides")}</h2>
            <p className="text-xs text-muted-foreground">
              {t("shopDetail.overrideHint")}
            </p>
          </div>
          {canWrite ? (
            <button
              type="button"
              onClick={() => void perform("shop.override", { id: shop.id })}
              className="min-h-10 rounded-md border px-3 text-sm"
            >
              {t("actions.addOverride")}
            </button>
          ) : null}
        </div>
        {overrides.length ? (
          <div className="mt-3 divide-y">
            {overrides.map((item) => (
              <div
                key={item.featureKey}
                className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
              >
                <div>
                  <b>{item.featureKey}</b>
                  <span className="ml-2 text-muted-foreground">
                    {item.enabled === null
                      ? "—"
                      : item.enabled
                        ? t("common.enabled")
                        : t("common.disabled")}{" "}
                    ·{" "}
                    {item.unlimited
                      ? t("planGrid.unlimited")
                      : (item.limit ?? "—")}
                  </span>
                  <p className="text-xs text-muted-foreground">{item.reason}</p>
                </div>
                {canWrite ? (
                  <button
                    type="button"
                    onClick={() =>
                      void notifyAction(
                        () => adminApi.removeOverride(shop.id, item.featureKey),
                        "saved",
                      )
                    }
                    className="min-h-9 rounded-md px-3 text-xs text-danger hover:bg-danger-soft"
                  >
                    {t("actions.remove")}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            {t("empty.noOverrides")}
          </p>
        )}
      </section>
      <div className="grid gap-4 xl:grid-cols-3">
        <section className="border bg-card p-4">
          <h2 className="font-semibold">{t("shopDetail.members")}</h2>
          {table(
            shop.members,
            [
              {
                key: "name",
                label: t("columns.user"),
                value: (member) => `${member.name} · ${member.email}`,
              },
              {
                key: "role",
                label: t("columns.role"),
                value: (member) =>
                  t(`roles.${member.role}`, { fallback: member.role }),
              },
            ],
            "empty.noMembers",
            undefined,
            (member) => String(member.userId),
          )}
        </section>
        <section className="border bg-card p-4">
          <h2 className="font-semibold">{t("shopDetail.channels")}</h2>
          {table(
            shop.channels,
            [
              {
                key: "name",
                label: t("columns.channel"),
                value: (item) => item.name,
              },
              {
                key: "type",
                label: t("columns.type"),
                value: (item) => item.type,
              },
              {
                key: "status",
                label: t("columns.status"),
                value: (item) => item.status,
              },
            ],
            "empty.noChannels",
          )}
        </section>
      </div>
    </div>
  );

  const renderOrderDetail = (order: AdminOrderDTO) => (
    <div className="space-y-5">
      <Link
        href="/admin/orders"
        className="inline-flex min-h-10 items-center gap-2 text-sm text-muted-foreground"
      >
        <ArrowLeft size={16} />
        {t("actions.backToOrders")}
      </Link>
      <section className="border bg-card p-4">
        <div className="flex flex-wrap justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">{order.orderNumber}</h2>
            <Link
              href={`/admin/shops/${order.shop.id}`}
              className="text-sm text-primary underline"
            >
              {order.shop.name}
            </Link>
          </div>
          <span className="rounded-sm bg-muted px-2 py-1 text-xs font-semibold">
            {t(`status.${order.status}`, { fallback: order.status })}
          </span>
        </div>
        <dl className="mt-4 grid gap-x-5 sm:grid-cols-2 xl:grid-cols-4">
          <LabelValue
            label={t("columns.customer")}
            value={order.customerName}
          />
          <LabelValue label={t("columns.phone")} value={order.customerPhone} />
          <LabelValue label={t("columns.address")} value={order.address} />
          <LabelValue
            label={t("columns.created")}
            value={date(order.createdAt)}
          />
          <LabelValue
            label={t("columns.total")}
            value={money(order.totalPaisa)}
          />
          <LabelValue
            label={t("columns.cod")}
            value={money(order.codAmountPaisa)}
          />
        </dl>
      </section>
      <section className="border bg-card p-4">
        <h2 className="mb-3 font-semibold">{t("orderDetail.items")}</h2>
        {table(
          order.items,
          [
            {
              key: "product",
              label: t("columns.product"),
              value: (item) =>
                `${item.productName}${item.variantName ? ` · ${item.variantName}` : ""}`,
            },
            {
              key: "quantity",
              label: t("columns.quantity"),
              value: (item) => item.quantity,
            },
            {
              key: "price",
              label: t("columns.total"),
              value: (item) => money(item.lineTotalPaisa),
            },
          ],
          "empty.noItems",
        )}
      </section>
      <section className="border bg-card p-4">
        <h2 className="mb-3 font-semibold">{t("orderDetail.timeline")}</h2>
        <ol className="space-y-3 border-l pl-4">
          {order.statusEvents.map((event) => (
            <li key={event.id} className="relative">
              <span className="absolute -left-5.25 top-2 size-2 rounded-full bg-primary" />
              <p className="text-sm font-medium">
                {t(`status.${event.toStatus}`, { fallback: event.toStatus })}
              </p>
              <p className="text-xs text-muted-foreground">
                {date(event.createdAt)}
                {event.note ? ` · ${event.note}` : ""}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );

  const renderVisitors = ([summary, ipPage, recentPage]: [
    VisitorSummaryDTO,
    AdminPage<VisitorIpRowDTO>,
    AdminPage<PageViewDTO>,
  ]) => (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-1 text-xs">
          <span>{t("visitors.range")}</span>
          <select
            value={range}
            onChange={(event) => setRange(event.target.value)}
            className="block min-h-10 rounded-md border bg-background px-3 text-sm"
          >
            {["1", "7", "30"].map((value) => (
              <option key={value} value={value}>
                {t(`visitors.days.${value}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs">
          <span>{t("fields.from")}</span>
          <input
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="block min-h-10 rounded-md border bg-background px-3 text-sm"
          />
        </label>
        <label className="space-y-1 text-xs">
          <span>{t("fields.to")}</span>
          <input
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="block min-h-10 rounded-md border bg-background px-3 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={refresh}
          className="grid size-10 place-items-center rounded-md border"
          aria-label={t("actions.refresh")}
        >
          <RefreshCw size={16} />
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStat label={t("visitors.pageViews")} value={summary.pageViews} />
        <AdminStat
          label={t("visitors.uniqueVisitors")}
          value={summary.uniqueVisitors}
        />
        <AdminStat label={t("visitors.uniqueIps")} value={summary.uniqueIps} />
        <AdminStat label={t("visitors.signups")} value={summary.signups} />
      </div>
      <section className="border bg-card p-4">
        <h2 className="font-semibold">{t("visitors.trend")}</h2>
        <div className="mt-4 h-64 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={summary.byDay}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} minTickGap={24} />
              <YAxis allowDecimals={false} width={34} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="pageViews"
                name={t("visitors.pageViews")}
                stroke="var(--primary)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="uniqueVisitors"
                name={t("visitors.uniqueVisitors")}
                stroke="var(--success)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-2">
        <section className="min-w-0 border bg-card p-4">
          <h2 className="mb-3 font-semibold">{t("visitors.topPages")}</h2>
          {table(
            summary.topPages,
            [
              {
                key: "path",
                label: t("columns.path"),
                value: (item) => item.path,
              },
              {
                key: "views",
                label: t("visitors.pageViews"),
                value: (item) => item.views,
              },
            ],
            "empty.noVisits",
          )}
        </section>
        <section className="border bg-card p-4">
          <h2 className="mb-3 font-semibold">{t("visitors.referrers")}</h2>
          {table(
            summary.topReferrers,
            [
              {
                key: "referrer",
                label: t("columns.referrer"),
                value: (item) => item.referrer,
              },
              {
                key: "views",
                label: t("visitors.pageViews"),
                value: (item) => item.views,
              },
            ],
            "empty.noVisits",
          )}
        </section>
      </div>
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-3">
        <section className="border bg-card p-4">
          <h2 className="mb-3 font-semibold">{t("visitors.campaigns")}</h2>
          {table(
            summary.topCampaigns,
            [
              {
                key: "source",
                label: t("columns.source"),
                value: (item) => item.utmSource,
              },
              {
                key: "campaign",
                label: t("visitors.campaign"),
                value: (item) => item.utmCampaign ?? "—",
              },
              {
                key: "views",
                label: t("visitors.pageViews"),
                value: (item) => item.views,
              },
            ],
            "empty.noVisits",
            undefined,
            (item) => `${item.utmSource}:${item.utmCampaign ?? ""}`,
          )}
        </section>
        <section className="border bg-card p-4">
          <h2 className="mb-3 font-semibold">{t("visitors.devices")}</h2>
          {table(
            summary.devices,
            [
              {
                key: "device",
                label: t("columns.device"),
                value: (item) => item.device,
              },
              {
                key: "views",
                label: t("visitors.pageViews"),
                value: (item) => item.views,
              },
            ],
            "empty.noVisits",
            undefined,
            (item) => item.device,
          )}
        </section>
        <section className="border bg-card p-4">
          <h2 className="mb-3 font-semibold">{t("visitors.countries")}</h2>
          {table(
            summary.countries,
            [
              {
                key: "country",
                label: t("columns.country"),
                value: (item) => item.country,
              },
              {
                key: "views",
                label: t("visitors.pageViews"),
                value: (item) => item.views,
              },
            ],
            "empty.noVisits",
            undefined,
            (item) => item.country,
          )}
        </section>
      </div>
      <section className="border bg-card p-4">
        <h2 className="mb-3 font-semibold">{t("visitors.ipList")}</h2>
        {table(
          ipPage.items,
          [
            { key: "ip", label: t("columns.ip"), value: (item) => item.ip },
            {
              key: "visits",
              label: t("columns.visits"),
              value: (item) => item.visits,
            },
            {
              key: "pages",
              label: t("columns.uniquePaths"),
              value: (item) => item.uniquePaths,
            },
            {
              key: "device",
              label: t("columns.device"),
              value: (item) =>
                `${item.device ?? "—"}${item.country ? ` · ${item.country}` : ""}`,
            },
            {
              key: "seen",
              label: t("columns.lastSeen"),
              value: (item) => date(item.lastSeenAt),
            },
            {
              key: "user",
              label: t("columns.account"),
              value: (item) =>
                item.isLoggedInUser ? t("common.yes") : t("common.no"),
            },
          ],
          "empty.noVisits",
          undefined,
          (item) => item.ip,
        )}
      </section>
      <section className="border bg-card p-4">
        <h2 className="mb-3 font-semibold">{t("visitors.recent")}</h2>
        {table(
          recentPage.items,
          [
            {
              key: "path",
              label: t("columns.path"),
              value: (item) => item.path,
            },
            {
              key: "referrer",
              label: t("columns.referrer"),
              value: (item) => item.referrer ?? "—",
            },
            {
              key: "device",
              label: t("columns.device"),
              value: (item) => item.device,
            },
            { key: "ip", label: t("columns.ip"), value: (item) => item.ip },
            {
              key: "created",
              label: t("columns.created"),
              value: (item) => date(item.createdAt),
            },
          ],
          "empty.noVisits",
        )}
      </section>
    </div>
  );

  const renderPlans = (plans: AdminPlanDTO[]) => (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {t("planGrid.overviewHint")}
        </p>
        {canWrite ? (
          <button
            type="button"
            onClick={() => openDialog("plan.create")}
            className="min-h-11 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            {t("actions.createPlan")}
          </button>
        ) : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.id} className="border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{plan.nameEn}</h2>
                <p className="text-xs text-muted-foreground">{plan.key}</p>
              </div>
              <span className="text-xs text-muted-foreground">
                {t("plans.subscribers", { count: plan.subscriberCount })}
              </span>
            </div>
            <p className="mt-4 text-lg font-semibold tabular-nums">
              {money(plan.priceMonthlyPaisa)}
              <span className="text-xs font-normal text-muted-foreground">
                {" "}
                / {t("billing.month")}
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              {money(plan.priceYearlyPaisa)} / {t("billing.year")}
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {plan.isDefault ? (
                <span className="rounded-sm bg-primary-soft px-2 py-1 text-xs text-primary">
                  {t("plans.default")}
                </span>
              ) : null}
              {plan.isLaunchPlan ? (
                <span className="rounded-sm bg-warning-soft px-2 py-1 text-xs">
                  {t("plans.launch")}
                </span>
              ) : null}
              {plan.isArchived ? (
                <span className="rounded-sm bg-muted px-2 py-1 text-xs">
                  {t("plans.archived")}
                </span>
              ) : null}
            </div>
            <div className="mt-4 flex gap-2">
              <Link
                href={`/admin/plans/${plan.id}`}
                className="inline-flex min-h-10 items-center gap-2 rounded-md border px-3 text-sm"
              >
                {t("actions.edit")}
              </Link>
              {canWrite && !plan.isArchived ? (
                <ActionButton
                  danger
                  onClick={() =>
                    void perform("plan.archive", plan as unknown as Row)
                  }
                >
                  {t("actions.archive")}
                </ActionButton>
              ) : null}
            </div>
          </article>
        ))}
      </div>
      <section className="overflow-x-auto border bg-card p-4">
        <h2 className="mb-3 font-semibold">{t("planGrid.title")}</h2>
        <table className="w-full min-w-175 text-sm">
          <thead>
            <tr className="border-b text-left">
              {[t("columns.feature"), ...plans.map((plan) => plan.nameEn)].map(
                (label, index) => (
                  <th key={`${label}-${index}`} className="px-3 py-2">
                    {label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {Array.from(
              new Set(
                plans.flatMap((plan) =>
                  plan.features.map((feature) => feature.featureKey),
                ),
              ),
            ).map((featureKey) => (
              <tr key={featureKey} className="border-b">
                <td className="px-3 py-2 font-medium">{featureKey}</td>
                {plans.map((plan) => {
                  const feature = plan.features.find(
                    (item) => item.featureKey === featureKey,
                  );
                  return (
                    <td key={plan.id} className="px-3 py-2">
                      {feature?.enabled
                        ? feature.unlimited
                          ? t("planGrid.unlimited")
                          : (feature.limit ?? t("common.enabled"))
                        : t("common.disabled")}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );

  const renderPlanDetail = ([plan, features]: [
    AdminPlanDTO,
    AdminFeatureDTO[],
  ]) => (
    <div className="space-y-5">
      <Link
        href="/admin/plans"
        className="inline-flex min-h-10 items-center gap-2 text-sm text-muted-foreground"
      >
        <ArrowLeft size={16} />
        {t("actions.backToPlans")}
      </Link>
      <section className="flex flex-wrap items-start justify-between gap-3 border bg-card p-4">
        <div>
          <h2 className="text-xl font-semibold">{plan.nameEn}</h2>
          <p className="text-sm text-muted-foreground">
            {plan.key} ·{" "}
            {t("plans.subscribers", { count: plan.subscriberCount })}
          </p>
        </div>
        {canWrite ? (
          <button
            type="button"
            onClick={() => openDialog("plan.edit", plan as unknown as Row)}
            className="min-h-10 rounded-md border px-3 text-sm"
          >
            {t("actions.editPlan")}
          </button>
        ) : null}
      </section>
      <dl className="grid gap-x-5 border bg-card px-4 sm:grid-cols-2 xl:grid-cols-4">
        <LabelValue
          label={t("fields.monthlyPriceTaka")}
          value={money(plan.priceMonthlyPaisa)}
        />
        <LabelValue
          label={t("fields.yearlyPriceTaka")}
          value={money(plan.priceYearlyPaisa)}
        />
        <LabelValue label={t("fields.trialDays")} value={plan.trialDays} />
        <LabelValue
          label={t("plans.visibility")}
          value={plan.isPublic ? t("common.public") : t("common.hidden")}
        />
      </dl>
      <PlanFeatureEditor
        key={`${plan.id}:${JSON.stringify(plan.features)}`}
        plan={plan}
        canWrite={canWrite}
        t={t}
        onSave={async (next) => {
          await notifyAction(
            () => adminApi.savePlanFeatures(plan.id, { features: next }),
            "saved",
          );
        }}
      />
      <section className="border bg-card p-4">
        <h2 className="font-semibold">{t("features.title")}</h2>
        {table(
          features,
          [
            {
              key: "key",
              label: t("columns.feature"),
              value: (item) => item.key,
            },
            {
              key: "type",
              label: t("columns.type"),
              value: (item) => item.type,
            },
            {
              key: "group",
              label: t("columns.group"),
              value: (item) => item.group,
            },
            {
              key: "state",
              label: t("columns.status"),
              value: (item) =>
                item.globalEnabled ? t("common.enabled") : t("common.disabled"),
            },
          ],
          "empty.noFeatures",
        )}
      </section>
    </div>
  );

  const renderFeatures = (features: AdminFeatureDTO[]) => (
    <section className="space-y-3">
      {table(
        features,
        [
          {
            key: "key",
            label: t("columns.feature"),
            value: (item) => (
              <span className="font-medium">
                {item.key}
                {!item.inCode ? (
                  <span className="ml-2 text-xs text-warning">
                    {t("features.unused")}
                  </span>
                ) : null}
              </span>
            ),
          },
          { key: "type", label: t("columns.type"), value: (item) => item.type },
          {
            key: "reset",
            label: t("columns.resetPeriod"),
            value: (item) => item.resetPeriod,
          },
          {
            key: "group",
            label: t("columns.group"),
            value: (item) => item.group,
          },
          {
            key: "name",
            label: t("columns.name"),
            value: (item) => item.nameEn,
          },
          {
            key: "global",
            label: t("columns.globalSwitch"),
            value: (item) => (
              <span
                className={item.globalEnabled ? "text-success" : "text-danger"}
              >
                {item.globalEnabled
                  ? t("common.enabled")
                  : t("common.disabled")}
              </span>
            ),
          },
        ],
        "empty.noFeatures",
        (item) =>
          canWrite ? (
            <ActionButton
              onClick={() =>
                void perform("feature.toggle", item as unknown as Row)
              }
            >
              {item.globalEnabled ? t("actions.disable") : t("actions.enable")}
            </ActionButton>
          ) : undefined,
      )}
    </section>
  );

  const renderPayments = (value: unknown) => {
    if (tab === "invoices") {
      const result = pageRows<AdminInvoiceDTO>(value);
      return (
        <div className="space-y-4">
          {table(
            result.items,
            [
              {
                key: "number",
                label: t("columns.invoice"),
                value: (item) => item.number,
              },
              {
                key: "shop",
                label: t("columns.shop"),
                value: (item) => item.shopName,
              },
              {
                key: "plan",
                label: t("columns.plan"),
                value: (item) => item.plan.nameEn,
              },
              {
                key: "total",
                label: t("columns.total"),
                value: (item) => money(item.totalPaisa),
              },
              {
                key: "status",
                label: t("columns.status"),
                value: (item) =>
                  t(`status.${item.status}`, { fallback: item.status }),
              },
              {
                key: "date",
                label: t("columns.created"),
                value: (item) => date(item.createdAt),
              },
            ],
            "empty.noInvoices",
          )}
          {paging(result)}
        </div>
      );
    }
    const result = pageRows<AdminPaymentDTO>(value);
    const columns: AdminColumn<AdminPaymentDTO>[] = [
      {
        key: "shop",
        label: t("columns.shop"),
        value: (item) => item.shop.name,
      },
      {
        key: "invoice",
        label: t("columns.invoice"),
        value: (item) => `${item.invoice.number} · ${item.invoice.planKey}`,
      },
      {
        key: "amount",
        label: t("columns.amount"),
        value: (item) => money(item.amountPaisa),
      },
      {
        key: "method",
        label: t("columns.method"),
        value: (item) =>
          `${item.provider}${item.manualMethod ? ` · ${item.manualMethod}` : ""}`,
      },
      {
        key: "transaction",
        label: t("columns.transaction"),
        value: (item) => item.providerTxnId ?? item.senderNumber ?? "—",
      },
      {
        key: "status",
        label: t("columns.status"),
        value: (item) => t(`status.${item.status}`, { fallback: item.status }),
      },
      {
        key: "created",
        label: t("columns.created"),
        value: (item) => date(item.createdAt),
      },
    ];
    return (
      <div className="space-y-4">
        {table(result.items, columns, "empty.noPayments", (item) => (
          <div className="flex flex-wrap gap-1">
            {canWrite && item.status === "PENDING_VERIFICATION" ? (
              <>
                <ActionButton
                  onClick={() =>
                    void perform("payment.approve", item as unknown as Row)
                  }
                >
                  {t("actions.approve")}
                </ActionButton>
                <ActionButton
                  danger
                  onClick={() =>
                    void perform("payment.reject", item as unknown as Row)
                  }
                >
                  {t("actions.reject")}
                </ActionButton>
              </>
            ) : null}
            {canWrite && item.needsRefund ? (
              <ActionButton
                onClick={() =>
                  void perform("payment.refund", item as unknown as Row)
                }
              >
                {t("actions.markRefunded")}
              </ActionButton>
            ) : null}
            {canWrite && item.status === "INITIATED" ? (
              <ActionButton
                onClick={() =>
                  void perform("payment.recheck", item as unknown as Row)
                }
              >
                {t("actions.recheck")}
              </ActionButton>
            ) : null}
          </div>
        ))}
        {paging(result)}
      </div>
    );
  };

  const renderCoupons = (coupons: CouponDTO[]) => (
    <div className="space-y-4">
      <div className="flex justify-end">
        {canWrite ? (
          <button
            type="button"
            onClick={() => openDialog("coupon.create")}
            className="min-h-11 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            {t("actions.createCoupon")}
          </button>
        ) : null}
      </div>
      {table(
        coupons,
        [
          {
            key: "code",
            label: t("columns.code"),
            value: (item) => <b>{item.code}</b>,
          },
          {
            key: "discount",
            label: t("columns.discount"),
            value: (item) =>
              item.type === "PERCENT" ? `${item.value}%` : money(item.value),
          },
          {
            key: "redemptions",
            label: t("columns.redemptions"),
            value: (item) =>
              `${item.redeemedCount}${item.maxRedemptions ? ` / ${item.maxRedemptions}` : ""}`,
          },
          {
            key: "validity",
            label: t("columns.validity"),
            value: (item) =>
              `${date(item.validFrom)} – ${date(item.validUntil)}`,
          },
          {
            key: "active",
            label: t("columns.status"),
            value: (item) =>
              item.isActive ? t("common.active") : t("common.inactive"),
          },
        ],
        "empty.noCoupons",
        (item) =>
          canWrite ? (
            <div className="flex gap-1">
              <ActionButton
                onClick={() =>
                  void perform("coupon.edit", item as unknown as Row)
                }
              >
                {t("actions.edit")}
              </ActionButton>
              <ActionButton
                danger
                onClick={() =>
                  void perform("coupon.delete", item as unknown as Row)
                }
              >
                {t("actions.delete")}
              </ActionButton>
            </div>
          ) : undefined,
      )}
      ;
    </div>
  );

  const renderAnnouncements = (items: AdminAnnouncementDTO[]) => (
    <div className="space-y-4">
      <div className="flex justify-end">
        {canWrite ? (
          <button
            type="button"
            onClick={() => openDialog("announcement.create")}
            className="min-h-11 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            {t("actions.createAnnouncement")}
          </button>
        ) : null}
      </div>
      {table(
        items,
        [
          {
            key: "title",
            label: t("columns.title"),
            value: (item) => (
              <span className="font-medium">
                {item.titleEn}
                <span className="block text-xs text-muted-foreground">
                  {t(`audiences.${item.audience}`)}
                  {item.planKey ? ` · ${item.planKey}` : ""}
                </span>
              </span>
            ),
          },
          {
            key: "variant",
            label: t("columns.variant"),
            value: (item) => t(`variants.${item.variant}`),
          },
          {
            key: "period",
            label: t("columns.validity"),
            value: (item) => `${date(item.startsAt)} – ${date(item.endsAt)}`,
          },
          {
            key: "active",
            label: t("columns.status"),
            value: (item) =>
              item.isActive ? t("common.active") : t("common.inactive"),
          },
        ],
        "empty.noAnnouncements",
        (item) =>
          canWrite ? (
            <div className="flex gap-1">
              <ActionButton
                onClick={() =>
                  void perform("announcement.edit", item as unknown as Row)
                }
              >
                {t("actions.edit")}
              </ActionButton>
              <ActionButton
                danger
                onClick={() =>
                  void perform("announcement.delete", item as unknown as Row)
                }
              >
                {t("actions.delete")}
              </ActionButton>
            </div>
          ) : undefined,
      )}
    </div>
  );

  const renderContent = (items: AdminContentDTO[]) => (
    <div className="space-y-4">
      {tabs(["FAQ", "TESTIMONIAL"])}
      <div className="flex justify-end">
        {canWrite ? (
          <button
            type="button"
            onClick={() => openDialog("content.create")}
            className="min-h-11 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            {t("actions.createContent")}
          </button>
        ) : null}
      </div>
      {table(
        items,
        [
          {
            key: "title",
            label: t("columns.title"),
            value: (item) => (
              <span className="font-medium">
                {item.titleEn}
                <span className="block text-xs text-muted-foreground">
                  {item.type}
                </span>
              </span>
            ),
          },
          {
            key: "body",
            label: t("columns.body"),
            value: (item) => (
              <span className="line-clamp-2">{item.bodyEn}</span>
            ),
          },
          {
            key: "author",
            label: t("columns.author"),
            value: (item) => item.authorName ?? "—",
          },
          {
            key: "order",
            label: t("columns.sortOrder"),
            value: (item) => item.sortOrder,
          },
        ],
        "empty.noContent",
        (item) =>
          canWrite ? (
            <div className="flex gap-1">
              <ActionButton
                onClick={() =>
                  void perform("content.edit", item as unknown as Row)
                }
              >
                {t("actions.edit")}
              </ActionButton>
              <ActionButton
                danger
                onClick={() =>
                  void perform("content.delete", item as unknown as Row)
                }
              >
                {t("actions.delete")}
              </ActionButton>
            </div>
          ) : undefined,
      )}
    </div>
  );

  const renderSettings = (settings: AdminSettingDTO[]) => {
    const settingDraft = {
      ...Object.fromEntries(
        settings.map((setting) => [setting.key, setting.value]),
      ),
      ...settingOverrides,
    };
    const groups = [
      "platform",
      "billing",
      "ai",
      "integrations",
      "sms",
      "landing",
      "security",
      "analytics",
    ];
    const visible = settings.filter((item) => item.group === tab);
    const save = async () => {
      const dangerous = [
        "platform.maintenanceMode",
        "platform.signupEnabled",
        "billing.freeLaunchMode",
        "ai.enabled",
      ];
      const changed = visible.filter(
        (setting) =>
          JSON.stringify(setting.value) !==
          JSON.stringify(settingDraft[setting.key]),
      );
      const critical = changed.filter(
        (setting) =>
          dangerous.includes(setting.key) ||
          setting.key === "ai.provider" ||
          setting.key === "ai.model",
      );
      if (
        critical.length &&
        !window.confirm(
          t("confirmations.dangerousSettings", {
            names: critical.map((setting) => setting.labelEn).join(", "),
          }),
        )
      )
        return;
      const values = Object.fromEntries(
        changed.map((setting) => {
          const raw = settingDraft[setting.key];
          if (setting.input === "json" && typeof raw === "string") {
            try {
              return [setting.key, JSON.parse(raw) as unknown];
            } catch {
              throw new Error(`Invalid JSON in ${setting.labelEn}`);
            }
          }
          if (setting.input === "number" && raw !== null && raw !== "")
            return [setting.key, Number(raw)];
          return [setting.key, raw];
        }),
      );
      if (
        await notifyAction(() => adminApi.updateSettings({ values }), "saved")
      )
        setSettingDraft({});
    };
    return (
      <div className="space-y-4">
        {tabs(groups)}
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {t("settings.secretNotice")}
          </p>
          {canWrite ? (
            <button
              type="button"
              onClick={() => void save()}
              disabled={busy}
              className="min-h-10 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {busy ? t("actions.saving") : t("actions.saveGroup")}
            </button>
          ) : null}
        </div>
        <div className="divide-y border bg-card px-4">
          {visible.map((setting) => {
            if (setting.key === "ai.pricing") {
              return (
                <div key={setting.key} className="py-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="block text-sm font-medium">
                        {setting.labelEn}
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        {setting.key}
                        {setting.descriptionEn ? ` · ${setting.descriptionEn}` : ""}
                      </span>
                    </div>
                  </div>
                  <AiPricingSettingEditor
                    value={settingDraft[setting.key]}
                    onChange={(val) =>
                      setSettingDraft((draft) => ({
                        ...draft,
                        [setting.key]: val,
                      }))
                    }
                    disabled={!canWrite}
                  />
                </div>
              );
            }
            return (
              <label
                key={setting.key}
                className="grid gap-2 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(240px,0.8fr)] sm:items-center"
              >
                <span>
                  <span className="block text-sm font-medium">
                    {setting.labelEn}
                  </span>
                  <span className="block break-all text-[11px] text-muted-foreground">
                    {setting.key}
                    {setting.descriptionEn ? ` · ${setting.descriptionEn}` : ""}
                  </span>
                </span>
                {setting.input === "boolean" ? (
                  <input
                    type="checkbox"
                    disabled={!canWrite}
                    checked={Boolean(settingDraft[setting.key])}
                    onChange={(event) =>
                      setSettingDraft((draft) => ({
                        ...draft,
                        [setting.key]: event.target.checked,
                      }))
                    }
                    className="size-5 accent-primary"
                  />
                ) : setting.input === "select" ? (
                  <select
                    disabled={!canWrite}
                    value={String(settingDraft[setting.key] ?? "")}
                    onChange={(event) =>
                      setSettingDraft((draft) => ({
                        ...draft,
                        [setting.key]: event.target.value,
                      }))
                    }
                    className="min-h-11 min-w-0 rounded-md border bg-background px-3"
                  >
                    {setting.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : setting.input === "textarea" || setting.input === "json" ? (
                  <textarea
                    disabled={!canWrite}
                    rows={setting.input === "json" ? 4 : 2}
                    value={
                      typeof settingDraft[setting.key] === "string"
                        ? String(settingDraft[setting.key])
                        : JSON.stringify(settingDraft[setting.key] ?? "", null, 2)
                    }
                    onChange={(event) =>
                      setSettingDraft((draft) => ({
                        ...draft,
                        [setting.key]: event.target.value,
                      }))
                    }
                    className="min-w-0 rounded-md border bg-background px-3 py-2 font-mono text-sm"
                  />
                ) : (
                  <input
                    disabled={!canWrite}
                    type={setting.input === "number" ? "number" : "text"}
                    value={
                      settingDraft[setting.key] == null
                        ? ""
                        : String(settingDraft[setting.key])
                    }
                    onChange={(event) =>
                      setSettingDraft((draft) => ({
                        ...draft,
                        [setting.key]:
                          setting.input === "number"
                            ? Number(event.target.value)
                            : event.target.value,
                      }))
                    }
                    className="min-h-11 min-w-0 rounded-md border bg-background px-3 text-sm"
                  />
                )}
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAuditLogs = (result: AdminPage<AuditLogDTO>) => (
    <div className="space-y-4">
      <AdminSearch
        value={search}
        placeholder={t("search.audit")}
        onChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
      />
      <AuditLogTable rows={result.items} />
      {paging(result)}
    </div>
  );

  const renderSystem = ([webhooks, jobs]: [
    AdminPage<WebhookEventDTO>,
    JobQueueStatsDTO[],
  ]) => (
    <div className="space-y-5">
      {tabs(["webhooks", "jobs", "health"])}
      <section className="border bg-card p-4">
        <h2 className="mb-3 font-semibold">
          {tab === "webhooks" ? t("system.webhooks") : t("system.jobs")}
        </h2>
        {tab === "webhooks" ? (
          table(
            webhooks.items,
            [
              {
                key: "source",
                label: t("columns.source"),
                value: (item) => item.source,
              },
              {
                key: "event",
                label: t("columns.event"),
                value: (item) => item.eventType,
              },
              {
                key: "status",
                label: t("columns.status"),
                value: (item) => item.status,
              },
              {
                key: "attempts",
                label: t("columns.attempts"),
                value: (item) => item.attempts,
              },
              {
                key: "error",
                label: t("columns.error"),
                value: (item) => item.error ?? "—",
              },
              {
                key: "received",
                label: t("columns.received"),
                value: (item) => date(item.receivedAt),
              },
            ],
            "empty.noWebhooks",
            (item) =>
              canWrite && ["FAILED", "IGNORED"].includes(item.status) ? (
                <ActionButton
                  onClick={() =>
                    void perform("webhook.replay", item as unknown as Row)
                  }
                >
                  {t("actions.replay")}
                </ActionButton>
              ) : undefined,
          )
        ) : tab === "jobs" ? (
          table(
            jobs,
            [
              {
                key: "queue",
                label: t("columns.queue"),
                value: (item) => item.queue,
              },
              {
                key: "active",
                label: t("columns.active"),
                value: (item) => item.active,
              },
              {
                key: "failed",
                label: t("columns.failed"),
                value: (item) => item.failed,
              },
              {
                key: "retry",
                label: t("columns.retry"),
                value: (item) => item.retry,
              },
              {
                key: "completed",
                label: t("columns.completed"),
                value: (item) => item.completed,
              },
            ],
            "empty.noJobs",
            (item) =>
              canWrite ? (
                <ActionButton
                  onClick={() =>
                    void perform("job.retry", item as unknown as Row)
                  }
                >
                  {t("actions.retryFailed")}
                </ActionButton>
              ) : undefined,
          )
        ) : (
          <p className="text-sm text-muted-foreground">
            {t("system.healthPath")}:{" "}
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1$/, "") ?? "http://localhost:4000"}/health`}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
            >
              /health
            </a>
          </p>
        )}
      </section>
    </div>
  );

  const renderUsage = (value: unknown) => {
    const result = pageRows<AdminUsageRowDTO | AdminAiUsageRowDTO>(value);

    const aiItems = (tab === "ai" ? result.items : []) as AdminAiUsageRowDTO[];
    const metaTotals = result.meta?.totals;

    const totalRuns =
      metaTotals?.runs ??
      aiItems.reduce((acc, row) => acc + (row.runs || 0), 0);
    const totalInputTokens =
      metaTotals?.inputTokens ??
      aiItems.reduce((acc, row) => acc + (row.inputTokens || 0), 0);
    const totalOutputTokens =
      metaTotals?.outputTokens ??
      aiItems.reduce((acc, row) => acc + (row.outputTokens || 0), 0);
    const totalTokens = totalInputTokens + totalOutputTokens;
    const totalCostMicroUsd =
      metaTotals?.costMicroUsd ??
      aiItems.reduce((acc, row) => acc + (row.costMicroUsd || 0), 0);
    const totalCostUsd = totalCostMicroUsd / 1_000_000;
    const totalBlocked =
      metaTotals?.blocked ??
      aiItems.reduce((acc, row) => acc + (row.blocked || 0), 0);
    const totalFailed =
      metaTotals?.failed ??
      aiItems.reduce((acc, row) => acc + (row.failed || 0), 0);

    const setQuickDate = (
      type: "all" | "today" | "7d" | "30d" | "thisMonth",
    ) => {
      setPage(1);
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      if (type === "all") {
        setFrom("");
        setTo("");
      } else if (type === "today") {
        setFrom(todayStr);
        setTo(todayStr);
      } else if (type === "7d") {
        const d = new Date(Date.now() - 6 * 86_400_000);
        setFrom(d.toISOString().slice(0, 10));
        setTo(todayStr);
      } else if (type === "30d") {
        const d = new Date(Date.now() - 29 * 86_400_000);
        setFrom(d.toISOString().slice(0, 10));
        setTo(todayStr);
      } else if (type === "thisMonth") {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        setFrom(firstDay.toISOString().slice(0, 10));
        setTo(todayStr);
      }
    };

    const aiFooterRow = (
      <tr className="border-t-2 border-border bg-muted/70 font-semibold text-foreground">
        <td className="px-3 py-3 text-sm">
          <span className="font-bold">সর্বমোট (Total)</span>
        </td>
        <td className="px-3 py-3 font-mono text-sm">
          {totalRuns.toLocaleString()}
        </td>
        <td className="px-3 py-3 font-mono text-sm">
          {totalInputTokens.toLocaleString()} /{" "}
          {totalOutputTokens.toLocaleString()}
        </td>
        <td className="px-3 py-3 font-mono text-sm font-bold text-emerald-500">
          ${totalCostUsd.toFixed(4)}
        </td>
        <td className="px-3 py-3 font-mono text-sm">{totalBlocked}</td>
        <td className="px-3 py-3 font-mono text-sm text-destructive/90">
          {totalFailed}
        </td>
      </tr>
    );

    const aiFooterMobile = (
      <div className="space-y-1.5 text-xs">
        <div className="border-b pb-1 text-sm font-bold">সর্বমোট (Total)</div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <span className="text-muted-foreground">মোট রান:</span>{" "}
            <strong>{totalRuns.toLocaleString()}</strong>
          </div>
          <div>
            <span className="text-muted-foreground">টোকেন:</span>{" "}
            <strong>
              {totalInputTokens.toLocaleString()} /{" "}
              {totalOutputTokens.toLocaleString()}
            </strong>
          </div>
          <div>
            <span className="text-muted-foreground">মোট খরচ:</span>{" "}
            <strong className="font-mono text-emerald-500">
              ${totalCostUsd.toFixed(4)}
            </strong>
          </div>
          <div>
            <span className="text-muted-foreground">ব্যর্থ / ব্লক:</span>{" "}
            <strong>
              {totalFailed} / {totalBlocked}
            </strong>
          </div>
        </div>
      </div>
    );

    return (
      <div className="space-y-4">
        {tabs(["usage", "ai"])}
        {tab === "usage" ? (
          <div className="flex flex-wrap items-end gap-3">
            <label className="space-y-1 text-xs">
              <span>{t("fields.featureKey")}</span>
              <input
                value={featureFilter}
                onChange={(event) => {
                  setFeatureFilter(event.target.value);
                  setPage(1);
                }}
                className="block min-h-10 rounded-md border bg-background px-3 text-sm"
              />
            </label>
            <label className="space-y-1 text-xs">
              <span>{t("fields.period")}</span>
              <input
                type="month"
                value={periodFilter}
                onChange={(event) => {
                  setPeriodFilter(event.target.value);
                  setPage(1);
                }}
                className="block min-h-10 rounded-md border bg-background px-3 text-sm"
              />
            </label>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-end gap-3">
              <label className="space-y-1 text-xs">
                <span>{t("fields.from")}</span>
                <input
                  type="date"
                  value={from}
                  onChange={(event) => {
                    setFrom(event.target.value);
                    setPage(1);
                  }}
                  className="block min-h-10 rounded-md border bg-background px-3 text-sm"
                />
              </label>
              <label className="space-y-1 text-xs">
                <span>{t("fields.to")}</span>
                <input
                  type="date"
                  value={to}
                  onChange={(event) => {
                    setTo(event.target.value);
                    setPage(1);
                  }}
                  className="block min-h-10 rounded-md border bg-background px-3 text-sm"
                />
              </label>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pb-0.5">
                <button
                  type="button"
                  onClick={() => setQuickDate("today")}
                  className="min-h-9 rounded-md border bg-muted/40 px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  আজকে (Today)
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate("7d")}
                  className="min-h-9 rounded-md border bg-muted/40 px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  গত ৭ দিন
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate("30d")}
                  className="min-h-9 rounded-md border bg-muted/40 px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  গত ৩০ দিন
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate("thisMonth")}
                  className="min-h-9 rounded-md border bg-muted/40 px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  এই মাস
                </button>
                {(from || to) && (
                  <button
                    type="button"
                    onClick={() => setQuickDate("all")}
                    className="min-h-9 rounded-md border border-dashed px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                  >
                    সব (রিসেট)
                  </button>
                )}
              </div>
            </div>

            {/* Total Metric Cards */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border bg-card p-4 shadow-xs space-y-1">
                <span className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>সর্বমোট AI খরচ</span>
                  <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
                </span>
                <div className="font-mono text-2xl font-bold text-emerald-500">
                  ${totalCostUsd.toFixed(4)}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  নির্বাচিত সময়কালের সর্বমোট খরচ (USD)
                </p>
              </div>

              <div className="rounded-lg border bg-card p-4 shadow-xs space-y-1">
                <span className="text-xs text-muted-foreground">
                  মোট AI রান (Runs)
                </span>
                <div className="font-mono text-2xl font-bold text-foreground">
                  {totalRuns.toLocaleString()}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  মোট সফল ও সম্পন্ন রিকোয়েস্ট
                </p>
              </div>

              <div className="rounded-lg border bg-card p-4 shadow-xs space-y-1">
                <span className="text-xs text-muted-foreground">
                  মোট টোকেন (Tokens)
                </span>
                <div className="font-mono text-2xl font-bold text-foreground">
                  {totalTokens.toLocaleString()}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  ইনপুট: {totalInputTokens.toLocaleString()} · আউটপুট:{" "}
                  {totalOutputTokens.toLocaleString()}
                </p>
              </div>

              <div className="rounded-lg border bg-card p-4 shadow-xs space-y-1">
                <span className="text-xs text-muted-foreground">ব্যর্থ ও ব্লক</span>
                <div className="font-mono text-2xl font-bold">
                  <span
                    className={
                      totalFailed > 0 ? "text-destructive" : "text-foreground"
                    }
                  >
                    {totalFailed} ব্যর্থ
                  </span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}
                    ·{" "}
                  </span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {totalBlocked} ব্লক
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  ব্যর্থ বা সিস্টেমে ব্লক হওয়া রান
                </p>
              </div>
            </div>
          </div>
        )}
        {tab === "usage"
          ? table(
              result.items as AdminUsageRowDTO[],
              [
                {
                  key: "shop",
                  label: t("columns.shop"),
                  value: (item) => item.shopName,
                },
                {
                  key: "plan",
                  label: t("columns.plan"),
                  value: (item) => item.planKey,
                },
                {
                  key: "feature",
                  label: t("columns.feature"),
                  value: (item) => item.featureKey,
                },
                {
                  key: "period",
                  label: t("fields.period"),
                  value: (item) => item.period,
                },
                {
                  key: "usage",
                  label: t("columns.usage"),
                  value: (item) =>
                    item.unlimited
                      ? t("planGrid.unlimited")
                      : `${item.used} / ${item.limit ?? "—"}`,
                },
              ],
              "empty.noUsage",
            )
          : table(
              aiItems,
              [
                {
                  key: "shop",
                  label: t("columns.shop"),
                  value: (item) => item.shopName,
                },
                {
                  key: "runs",
                  label: t("columns.runs"),
                  value: (item) => item.runs,
                },
                {
                  key: "tokens",
                  label: t("columns.tokens"),
                  value: (item) => `${item.inputTokens} / ${item.outputTokens}`,
                },
                {
                  key: "cost",
                  label: t("columns.costUsd"),
                  value: (item) =>
                    `$${(item.costMicroUsd / 1_000_000).toFixed(4)}`,
                },
                {
                  key: "blocked",
                  label: t("columns.blocked"),
                  value: (item) => item.blocked,
                },
                {
                  key: "failed",
                  label: t("columns.failed"),
                  value: (item) => item.failed,
                },
              ],
              "empty.noUsage",
              undefined,
              undefined,
              aiFooterRow,
              aiFooterMobile,
            )}
        {paging(result)}
      </div>
    );
  };

  const exportOrders = async () => {
    try {
      const blob = await adminApi.exportOrders({ search: search || undefined });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "orders.csv";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error(t("messages.actionFailed"));
    }
  };

  const renderActionTabs = () => {
    if (screen === "payments")
      return tabs(["pending", "refunds", "all", "invoices"]);
    if (screen === "usage") return null;
    return null;
  };

  const modalTitle = dialog
    ? t(`dialogs.${dialog.action}`, { fallback: t("dialogs.confirmAction") })
    : "";
  return (
    <div className="space-y-5">
      <PageHeader
        title={pageTitle}
        description={pageDescription}
        action={
          screen === "overview" ? (
            <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldAlert size={15} />
              {t("overview.adminAccess")}
            </span>
          ) : undefined
        }
      />
      {screen === "shops" ||
      screen === "users" ||
      screen === "orders" ||
      screen === "auditLogs" ? (
        <AdminSearch
          value={search}
          placeholder={t(`search.${screen}`)}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
        />
      ) : null}
      {renderActionTabs()}
      {renderData()}
      {dialog ? (
        <AdminDialog
          title={modalTitle}
          fields={actionFields()}
          submitLabel={t("actions.confirm")}
          closeLabel={t("actions.close")}
          cancelLabel={t("actions.cancel")}
          busy={busy}
          error={dialogError}
          onClose={() => setDialog(null)}
          onSubmit={(values) => void submitDialog(values)}
        />
      ) : null}
    </div>
  );
}
