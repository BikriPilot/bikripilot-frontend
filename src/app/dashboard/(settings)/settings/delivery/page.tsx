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
export default function DeliverySettingsPage() {
  const t = useTranslations("step8");
  const { shopId } = useCurrentShop();
  const query = useQuery({
    queryKey: ["settings", shopId],
    queryFn: () => shopsApi.settings(shopId!),
    enabled: Boolean(shopId),
  });
  type FormState = Partial<
    Pick<
      ShopSettingsDTO,
      "orderPrefix" | "duplicateWindowHours" | "allowOversell"
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
          ? { freeDeliveryMinPaisa: Number(form.freeDeliveryMinPaisa) * 100 }
          : {}),
        ...(form.allowOversell !== undefined
          ? { allowOversell: form.allowOversell }
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
    <div className="space-y-6">
      <PageHeader
        title={t("deliveryTitle")}
        description={t("deliveryDescription")}
      />
      <form
        onSubmit={save}
        className="grid max-w-2xl gap-4 rounded-2xl border bg-card p-5 sm:p-7"
      >
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
            form.duplicateWindowHours ?? String(settings.duplicateWindowHours)
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
          label={t("freeDelivery")}
          inputMode="decimal"
          value={
            form.freeDeliveryMinPaisa !== undefined
              ? String(Number(form.freeDeliveryMinPaisa) / 100)
              : settings.freeDeliveryMinPaisa === null
                ? ""
                : String(settings.freeDeliveryMinPaisa / 100)
          }
          onChange={(event) =>
            setForm({ ...form, freeDeliveryMinPaisa: event.target.value })
          }
        />
        <label className="flex min-h-11 items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={Boolean(form.allowOversell ?? settings.allowOversell)}
            onChange={(event) =>
              setForm({ ...form, allowOversell: event.target.checked })
            }
            className="size-4 accent-primary"
          />
          {t("allowOversell")}
        </label>
        <button
          disabled={busy}
          className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          {busy ? t("loading") : t("saveChanges")}
        </button>
      </form>
    </div>
  );
}
