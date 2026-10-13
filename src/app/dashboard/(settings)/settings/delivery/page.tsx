"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/common/PageHeader";
import { Field } from "@/components/common/Field";
import { ErrorState } from "@/components/common/PageStates";
import { FormSkeleton } from "@/components/common/skeletons";
import { shopsApi } from "@/lib/api/shops.api";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import type { ShopSettingsDTO } from "@/types/shop";
import { toast } from "sonner";
import { PAYMENT_METHODS } from "@/constants/enums";
export default function DeliverySettingsPage() {
  const t = useTranslations("step8");
  const advanceText = useTranslations("orders.advance");
  const enumText = useTranslations("enums.PaymentMethod");
  const { shopId, can } = useCurrentShop();
  const query = useQuery({
    queryKey: ["settings", shopId],
    queryFn: () => shopsApi.settings(shopId!),
    enabled: Boolean(shopId),
  });
  type FormState = Partial<
    Pick<
      ShopSettingsDTO,
      | "orderPrefix"
      | "duplicateWindowHours"
      | "allowOversell"
      | "defaultPaymentMethod"
      | "lowStockThreshold"
      | "invoiceNote"
      | "publicTrackingEnabled"
      | "advanceMode"
      | "partialAdvancePaisa"
      | "bkashNumber"
      | "bkashType"
      | "nagadNumber"
      | "nagadType"
      | "rocketNumber"
      | "rocketType"
    >
  > & {
    freeDeliveryMinPaisa?: string;
    deliveryChargeInsideDhakaPaisa?: string;
    deliveryChargeSubDhakaPaisa?: string;
    deliveryChargeOutsideDhakaPaisa?: string;
  };
  const [form, setForm] = useState<FormState>({});
  const [busy, setBusy] = useState(false);
  if (query.isPending) return <FormSkeleton fields={6} />;
  if (query.isError || !query.data)
    return <ErrorState onRetry={() => void query.refetch()} />;
  const settings = query.data;
  const taka = (
    key:
      | "deliveryChargeInsideDhakaPaisa"
      | "deliveryChargeSubDhakaPaisa"
      | "deliveryChargeOutsideDhakaPaisa",
  ) =>
    form[key] ??
    String(Number(settings[key as keyof typeof settings] ?? 0) / 100);
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const body = {
        ...(form.advanceMode !== undefined
          ? { advanceMode: form.advanceMode }
          : {}),
        ...(form.partialAdvancePaisa !== undefined
          ? { partialAdvancePaisa: form.partialAdvancePaisa }
          : {}),
        deliveryChargeInsideDhakaPaisa: Math.round(
          Number(taka("deliveryChargeInsideDhakaPaisa")) * 100,
        ),
        deliveryChargeSubDhakaPaisa: Math.round(
          Number(taka("deliveryChargeSubDhakaPaisa")) * 100,
        ),
        deliveryChargeOutsideDhakaPaisa: Math.round(
          Number(taka("deliveryChargeOutsideDhakaPaisa")) * 100,
        ),
        ...(form.orderPrefix !== undefined
          ? { orderPrefix: form.orderPrefix }
          : {}),
        ...(form.duplicateWindowHours !== undefined
          ? { duplicateWindowHours: Number(form.duplicateWindowHours) }
          : {}),
        ...(form.freeDeliveryMinPaisa !== undefined
          ? {
              freeDeliveryMinPaisa:
                form.freeDeliveryMinPaisa.trim() === ""
                  ? null
                  : Math.round(Number(form.freeDeliveryMinPaisa) * 100),
            }
          : {}),
        ...(form.allowOversell !== undefined
          ? { allowOversell: form.allowOversell }
          : {}),
        ...(form.defaultPaymentMethod !== undefined
          ? { defaultPaymentMethod: form.defaultPaymentMethod }
          : {}),
        ...(form.lowStockThreshold !== undefined
          ? { lowStockThreshold: form.lowStockThreshold }
          : {}),
        ...(form.invoiceNote !== undefined
          ? { invoiceNote: form.invoiceNote?.trim() || null }
          : {}),
        ...(form.publicTrackingEnabled !== undefined
          ? { publicTrackingEnabled: form.publicTrackingEnabled }
          : {}),
        ...(form.bkashNumber !== undefined
          ? { bkashNumber: form.bkashNumber ? form.bkashNumber.trim() : null }
          : {}),
        ...(form.bkashType !== undefined
          ? { bkashType: form.bkashType }
          : {}),
        ...(form.nagadNumber !== undefined
          ? { nagadNumber: form.nagadNumber ? form.nagadNumber.trim() : null }
          : {}),
        ...(form.nagadType !== undefined
          ? { nagadType: form.nagadType }
          : {}),
        ...(form.rocketNumber !== undefined
          ? { rocketNumber: form.rocketNumber ? form.rocketNumber.trim() : null }
          : {}),
        ...(form.rocketType !== undefined
          ? { rocketType: form.rocketType }
          : {}),
      };
      await shopsApi.updateSettings(shopId!, body);
      toast.success(t("saved"));
      await query.refetch();
      setForm({});
    } catch {
      toast.error(t("genericError"));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="w-full max-w-5xl space-y-6">
      <PageHeader
        title={t("deliveryTitle")}
        description={t("deliveryDescription")}
      />
      <form
        onSubmit={save}
        className="w-full space-y-8 rounded-2xl border bg-card p-6 shadow-xs sm:p-8"
      >
        {/* Section 1: Standard Delivery Rates */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">
            {t("deliveryTitle")}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field
              label={t("insideDhaka")}
              inputMode="decimal"
              value={taka("deliveryChargeInsideDhakaPaisa")}
              onChange={(event) =>
                setForm({
                  ...form,
                  deliveryChargeInsideDhakaPaisa: event.target.value,
                })
              }
            />
            <Field
              label={t("subDhaka")}
              inputMode="decimal"
              value={taka("deliveryChargeSubDhakaPaisa")}
              onChange={(event) =>
                setForm({
                  ...form,
                  deliveryChargeSubDhakaPaisa: event.target.value,
                })
              }
            />
            <Field
              label={t("outsideDhaka")}
              inputMode="decimal"
              value={taka("deliveryChargeOutsideDhakaPaisa")}
              onChange={(event) =>
                setForm({
                  ...form,
                  deliveryChargeOutsideDhakaPaisa: event.target.value,
                })
              }
            />
          </div>
        </div>

        {/* Section 2: Advance Payment & Checkout Policy */}
        <div className="border-t pt-6">
          <h2 className="text-base font-semibold text-foreground mb-3">
            {advanceText("policy")}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              {advanceText("policy")}
              <select
                className="min-h-11 rounded-lg border bg-background px-3 text-base"
                value={form.advanceMode ?? settings.advanceMode ?? "NONE"}
                onChange={(event) =>
                  setForm({
                    ...form,
                    advanceMode: event.target
                      .value as ShopSettingsDTO["advanceMode"],
                  })
                }
              >
                <option value="NONE">{advanceText("none")}</option>
                <option value="DELIVERY_CHARGE">{advanceText("delivery")}</option>
                <option value="PARTIAL">{advanceText("partial")}</option>
              </select>
            </label>
            {(form.advanceMode ?? settings.advanceMode) === "PARTIAL" ? (
              <Field
                label={advanceText("partialAmount")}
                type="number"
                min="0.01"
                step="0.01"
                required
                value={
                  (form.partialAdvancePaisa ??
                    settings.partialAdvancePaisa ??
                    0) / 100
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    partialAdvancePaisa: Math.round(
                      Number(event.target.value) * 100,
                    ),
                  })
                }
              />
            ) : (
              <Field
                label={t("freeDelivery")}
                inputMode="decimal"
                value={
                  form.freeDeliveryMinPaisa !== undefined
                    ? form.freeDeliveryMinPaisa
                    : settings.freeDeliveryMinPaisa === null
                      ? ""
                      : String(settings.freeDeliveryMinPaisa / 100)
                }
                onChange={(event) =>
                  setForm({ ...form, freeDeliveryMinPaisa: event.target.value })
                }
              />
            )}
            {(form.advanceMode ?? settings.advanceMode) === "PARTIAL" && (
              <Field
                label={t("freeDelivery")}
                inputMode="decimal"
                value={
                  form.freeDeliveryMinPaisa !== undefined
                    ? form.freeDeliveryMinPaisa
                    : settings.freeDeliveryMinPaisa === null
                      ? ""
                      : String(settings.freeDeliveryMinPaisa / 100)
                }
                onChange={(event) =>
                  setForm({ ...form, freeDeliveryMinPaisa: event.target.value })
                }
              />
            )}
            <label className="grid gap-2 text-sm font-medium">
              {t("defaultPaymentMethod")}
              <select
                value={
                  form.defaultPaymentMethod ?? settings.defaultPaymentMethod
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    defaultPaymentMethod: event.target.value,
                  })
                }
                className="h-11 rounded-lg border bg-background px-3 text-base"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {enumText(method)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Section 2.5: MFS Advance Payment Accounts */}
        <div className="border-t pt-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {t("mfsTitle")}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {t("mfsDescription")}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* bKash */}
            <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-pink-600 dark:text-pink-400">bKash (বিকাশ)</span>
              </div>
              <Field
                label={t("accountNumber")}
                placeholder="01XXXXXXXXX"
                value={form.bkashNumber !== undefined ? (form.bkashNumber ?? "") : (settings.bkashNumber ?? "")}
                onChange={(event) =>
                  setForm({ ...form, bkashNumber: event.target.value })
                }
              />
              <label className="grid gap-1.5 text-xs font-medium">
                {t("accountType")}
                <select
                  value={form.bkashType ?? settings.bkashType ?? "PERSONAL"}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      bkashType: event.target.value as "PERSONAL" | "MERCHANT",
                    })
                  }
                  className="h-10 rounded-lg border bg-background px-3 text-sm"
                >
                  <option value="PERSONAL">{t("typePersonal")}</option>
                  <option value="MERCHANT">{t("typeMerchant")}</option>
                </select>
              </label>
            </div>

            {/* Nagad */}
            <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-amber-600 dark:text-amber-400">Nagad (নগদ)</span>
              </div>
              <Field
                label={t("accountNumber")}
                placeholder="01XXXXXXXXX"
                value={form.nagadNumber !== undefined ? (form.nagadNumber ?? "") : (settings.nagadNumber ?? "")}
                onChange={(event) =>
                  setForm({ ...form, nagadNumber: event.target.value })
                }
              />
              <label className="grid gap-1.5 text-xs font-medium">
                {t("accountType")}
                <select
                  value={form.nagadType ?? settings.nagadType ?? "PERSONAL"}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      nagadType: event.target.value as "PERSONAL" | "MERCHANT",
                    })
                  }
                  className="h-10 rounded-lg border bg-background px-3 text-sm"
                >
                  <option value="PERSONAL">{t("typePersonal")}</option>
                  <option value="MERCHANT">{t("typeMerchant")}</option>
                </select>
              </label>
            </div>

            {/* Rocket */}
            <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-purple-600 dark:text-purple-400">Rocket (রকেট)</span>
              </div>
              <Field
                label={t("accountNumber")}
                placeholder="01XXXXXXXXX"
                value={form.rocketNumber !== undefined ? (form.rocketNumber ?? "") : (settings.rocketNumber ?? "")}
                onChange={(event) =>
                  setForm({ ...form, rocketNumber: event.target.value })
                }
              />
              <label className="grid gap-1.5 text-xs font-medium">
                {t("accountType")}
                <select
                  value={form.rocketType ?? settings.rocketType ?? "PERSONAL"}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      rocketType: event.target.value as "PERSONAL" | "MERCHANT",
                    })
                  }
                  className="h-10 rounded-lg border bg-background px-3 text-sm"
                >
                  <option value="PERSONAL">{t("typePersonal")}</option>
                  <option value="MERCHANT">{t("typeMerchant")}</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: Order Numbering & Fraud Prevention */}
        <div className="border-t pt-6">
          <h2 className="text-base font-semibold text-foreground mb-3">
            {t("orderPrefix")} & {t("duplicateWindow")}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field
              label={t("orderPrefix")}
              value={form.orderPrefix ?? settings.orderPrefix}
              onChange={(event) =>
                setForm({ ...form, orderPrefix: event.target.value })
              }
            />
            <Field
              label={t("duplicateWindow")}
              inputMode="numeric"
              value={
                form.duplicateWindowHours ??
                String(settings.duplicateWindowHours)
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  duplicateWindowHours: Number(
                    event.target.value.replace(/\D/g, ""),
                  ),
                })
              }
            />
            <Field
              label={t("lowStockThreshold")}
              type="number"
              min={0}
              step={1}
              value={form.lowStockThreshold ?? settings.lowStockThreshold}
              onChange={(event) =>
                setForm({
                  ...form,
                  lowStockThreshold: Number(event.target.value),
                })
              }
            />
          </div>
        </div>

        {/* Section 4: Invoice Note & Order Policies */}
        <div className="border-t pt-6 space-y-4">
          <label className="grid gap-2 text-sm font-medium">
            {t("invoiceNote")}
            <textarea
              value={form.invoiceNote ?? settings.invoiceNote ?? ""}
              onChange={(event) =>
                setForm({ ...form, invoiceNote: event.target.value })
              }
              rows={3}
              className="rounded-lg border bg-background p-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-1">
            <label className="flex items-center gap-3 text-sm rounded-xl border p-3.5 bg-background/50 hover:bg-muted/50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={
                  form.publicTrackingEnabled ?? settings.publicTrackingEnabled
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    publicTrackingEnabled: event.target.checked,
                  })
                }
                className="size-4 accent-primary"
              />
              <span className="font-medium">{t("publicTrackingEnabled")}</span>
            </label>
            <label className="flex items-center gap-3 text-sm rounded-xl border p-3.5 bg-background/50 hover:bg-muted/50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={Boolean(form.allowOversell ?? settings.allowOversell)}
                onChange={(event) =>
                  setForm({ ...form, allowOversell: event.target.checked })
                }
                className="size-4 accent-primary"
              />
              <span className="font-medium">{t("allowOversell")}</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button
            disabled={busy || !can("shop.manage")}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            {busy ? t("loading") : t("saveChanges")}
          </button>
        </div>
      </form>
    </div>
  );
}
