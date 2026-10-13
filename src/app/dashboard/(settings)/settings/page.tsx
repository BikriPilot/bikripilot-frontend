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
        className="max-w-4xl rounded-2xl border bg-card p-6 shadow-xs sm:p-8"
      >
        <div className="space-y-6">
          {/* Logo & Basic Identity Section */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-[140px_1fr] sm:items-start border-b pb-6">
            <div className="grid gap-2 text-sm font-medium">
              <span>{t("shopLogo")}</span>
              <ImageUploader
                purpose="shop_logo"
                max={1}
                value={shop.logoUrl ? [shop.logoUrl] : []}
                onChange={async (images) => {
                  try {
                    await shopsApi.update(shopId!, {
                      logoUrl: images[0] ?? null,
                    });
                    await query.refetch();
                    toast.success(t("saved"));
                  } catch {
                    toast.error(t("genericError"));
                  }
                }}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field
                  label={t("businessName")}
                  value={value("name")}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  required
                />
              </div>
              <Field
                label={t("email")}
                type="email"
                value={value("email")}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
              />
              <Field
                label={t("phone")}
                value={value("phone")}
                onChange={(event) =>
                  setForm({ ...form, phone: event.target.value })
                }
                inputMode="tel"
              />
            </div>
          </div>

          {/* Online Presence & Location Section */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field
              label={t("website")}
              value={value("websiteUrl")}
              onChange={(event) =>
                setForm({ ...form, websiteUrl: event.target.value })
              }
              placeholder="https://yourshop.com"
            />
            <Field
              label={t("district")}
              value={value("district")}
              onChange={(event) =>
                setForm({ ...form, district: event.target.value })
              }
            />
            <div className="sm:col-span-2">
              <Field
                label={t("facebookPage")}
                value={value("facebookPageUrl")}
                onChange={(event) =>
                  setForm({ ...form, facebookPageUrl: event.target.value })
                }
                placeholder="https://facebook.com/yourpage"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              disabled={busy}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              {busy ? t("loading") : t("saveChanges")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
