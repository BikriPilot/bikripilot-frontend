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
import { toast } from "sonner";
import { ImageUploader } from "@/components/common/ImageUploader";
export default function ShopSettingsPage() {
  const t = useTranslations("step8");
  const { shopId } = useCurrentShop();
  const query = useQuery({
    queryKey: ["shop", shopId],
    queryFn: () => shopsApi.get(shopId!),
    enabled: Boolean(shopId),
  });
  const [form, setForm] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  if (query.isPending) return <FormSkeleton fields={7} />;
  if (query.isError || !query.data)
    return <ErrorState onRetry={() => void query.refetch()} />;
  const shop = query.data;
  const value = (key: string) =>
    form[key] ?? String(shop[key as keyof typeof shop] ?? "");
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await shopsApi.update(
        shopId!,
        Object.fromEntries(
          Object.entries(form).filter(([, item]) => item !== ""),
        ),
      );
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
        title={t("shopSettingsTitle")}
        description={t("shopSettingsDescription")}
      />
      <form
        onSubmit={save}
        className="max-w-2xl space-y-4 rounded-2xl border bg-card p-5 sm:p-7"
      >
        <Field
          label={t("businessName")}
          value={value("name")}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
        />
        <div className="grid gap-2 text-sm font-medium">
          <span>{t("shopLogo")}</span>
          <ImageUploader
            purpose="shop_logo"
            max={1}
            value={shop.logoUrl ? [shop.logoUrl] : []}
            onChange={async (images) => {
              try {
                await shopsApi.update(shopId!, { logoUrl: images[0] ?? null });
                await query.refetch();
                toast.success(t("saved"));
              } catch {
                toast.error(t("genericError"));
              }
            }}
          />
        </div>
        <Field
          label={t("phone")}
          value={value("phone")}
          onChange={(event) => setForm({ ...form, phone: event.target.value })}
        />
        <Field
          label={t("website")}
          value={value("websiteUrl")}
          onChange={(event) =>
            setForm({ ...form, websiteUrl: event.target.value })
          }
        />
        <Field
          label={t("facebookPage")}
          value={value("facebookPageUrl")}
          onChange={(event) =>
            setForm({ ...form, facebookPageUrl: event.target.value })
          }
        />
        <Field
          label={t("district")}
          value={value("district")}
          onChange={(event) =>
            setForm({ ...form, district: event.target.value })
          }
        />
        <Field
          label={t("email")}
          type="email"
          value={value("email")}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
        />
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
