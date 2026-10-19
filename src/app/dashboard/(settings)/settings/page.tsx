"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PageHeader } from "@/components/common/PageHeader";
import { Field } from "@/components/common/Field";
import { ErrorState } from "@/components/common/PageStates";
import { FormSkeleton } from "@/components/common/skeletons";
import { shopsApi } from "@/lib/api/shops.api";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { toast } from "sonner";
import { ImageUploader } from "@/components/common/ImageUploader";
import { Store, Headphones, AlertTriangle } from "lucide-react";

export default function ShopSettingsPage() {
  const locale = useLocale();
  const isBn = locale === "bn";
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
    const shopName = value("name").trim();
    const fbUrl = value("facebookPageUrl").trim();

    if (!shopName) {
      toast.error(isBn ? "শপের নাম প্রদান করা আবশ্যক।" : "Shop name is required.");
      return;
    }
    if (!shop.logoUrl && !form.logoUrl) {
      toast.error(isBn ? "শপের লোগো বা ছবি আপলোড করা আবশ্যক।" : "Shop logo/image is required.");
      return;
    }
    if (!fbUrl) {
      toast.error(isBn ? "ফেসবুক পেজের লিংক প্রদান করা আবশ্যক।" : "Facebook page link is required.");
      return;
    }

    setBusy(true);
    try {
      await shopsApi.update(
        shopId!,
        Object.fromEntries(
          Object.entries(form).map(([key, val]) => [key, val.trim() || null]),
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

  const isShopComplete = Boolean(shop.name?.trim() && shop.logoUrl && shop.facebookPageUrl?.trim());

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <PageHeader
        title={t("shopSettingsTitle")}
        description={t("shopSettingsDescription")}
      />

      <form
        onSubmit={save}
        className="w-full rounded-2xl border bg-card p-6 shadow-xs sm:p-8 space-y-8"
      >
        {/* Status indicator */}
        {!isShopComplete && (
          <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-300">
            <AlertTriangle size={16} className="shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              {isBn
                ? "সেলস চ্যানেল কানেক্ট করার আগে শপের নাম, লোগো এবং ফেসবুক পেজ লিংক যোগ করা আবশ্যক।"
                : "Shop Name, Logo Image, and Facebook Page link are required before connecting sales channels."}
            </span>
          </div>
        )}

        {/* Section 1: Logo & Store Identity */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b pb-3">
            <Store size={18} className="text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {isBn ? "শপ ও ব্র্যান্ড পরিচিতি" : "Store Identity"}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr] md:items-start">
            <div className="grid gap-2 text-sm font-medium">
              <span className="flex items-center gap-1">
                <span>{t("shopLogo")}</span>
                <span className="text-danger">*</span>
              </span>
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

            <div className="space-y-4">
              {/* Row 1: Business name and Facebook page link in 1 line */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label={`${t("businessName")} *`}
                  value={value("name")}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder={isBn ? "আপনার শপের নাম" : "My Awesome Shop"}
                  required
                />
                <Field
                  label={`${t("facebookPage")} *`}
                  value={value("facebookPageUrl")}
                  onChange={(event) =>
                    setForm({ ...form, facebookPageUrl: event.target.value })
                  }
                  placeholder="https://facebook.com/yourpage"
                  required
                />
              </div>

              {/* Row 2: Website or domain & Business category in 1 line */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label={`${t("website")} (${isBn ? "ঐচ্ছিক" : "Optional"})`}
                  value={value("websiteUrl")}
                  onChange={(event) =>
                    setForm({ ...form, websiteUrl: event.target.value })
                  }
                  placeholder="https://yourshop.com"
                />
                <label className="grid gap-2 text-sm font-medium">
                  <span className="flex items-center justify-between">
                    <span>{t("businessCategory")}</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      {isBn ? "ঐচ্ছিক" : "Optional"}
                    </span>
                  </span>
                  <select
                    className="min-h-11 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    value={value("businessCategory")}
                    onChange={(event) =>
                      setForm({ ...form, businessCategory: event.target.value })
                    }
                  >
                    <option value="">{t("selectCategory")}</option>
                    <option value="fashion">{isBn ? "পোশাক ও ফ্যাশন (Fashion & Clothing)" : "Fashion & Clothing"}</option>
                    <option value="cosmetics">{isBn ? "কসমেটিকস ও রূপচর্চা (Cosmetics & Beauty)" : "Cosmetics & Beauty"}</option>
                    <option value="electronics">{isBn ? "ইলেকট্রনিক্স (Electronics)" : "Electronics"}</option>
                    <option value="gadgets">{isBn ? "গ্যাজেট ও এক্সেসরিজ (Gadgets & Accessories)" : "Gadgets & Accessories"}</option>
                    <option value="food">{isBn ? "খাবার ও রেস্তোরাঁ (Food & Beverage)" : "Food & Beverage"}</option>
                    <option value="grocery">{isBn ? "মুদি ও নিত্যপ্রয়োজনীয় (Grocery & Essentials)" : "Grocery & Essentials"}</option>
                    <option value="home_decor">{isBn ? "ঘর সাজানো ও গৃহস্থালি (Home & Living)" : "Home & Living"}</option>
                    <option value="kids">{isBn ? "বাচ্চাদের পণ্য ও খেলনা (Kids & Baby)" : "Kids & Baby"}</option>
                    <option value="books">{isBn ? "বই ও স্টেশনারি (Books & Stationery)" : "Books & Stationery"}</option>
                    <option value="health">{isBn ? "স্বাস্থ্য ও সেবা (Health & Wellness)" : "Health & Wellness"}</option>
                    <option value="jewellery">{isBn ? "গহনা ও ঘড়ি (Jewellery & Watches)" : "Jewellery & Watches"}</option>
                    <option value="handicrafts">{isBn ? "হস্তশিল্প (Handicrafts)" : "Handicrafts"}</option>
                    <option value="pets">{isBn ? "পোষা প্রাণী (Pets & Animals)" : "Pets & Animals"}</option>
                    <option value="other">{isBn ? "অন্যান্য (Other / General)" : "Other / General"}</option>
                  </select>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Customer-Facing Support Contact (Optional) */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-2">
              <Headphones size={18} className="text-primary" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {isBn ? "গ্রাহক সহায়তা ও যোগাযোগের তথ্য" : "Customer Support Contacts"}
              </h2>
            </div>
            <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {isBn ? "ঐচ্ছিক" : "Optional"}
            </span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            {isBn
              ? "এই ইমেইল ও ফোন নম্বরটি কাস্টমারদের ইনভয়েস ও সাপোর্ট প্রশ্নের জন্য প্রদর্শিত হবে। এটি আপনার মূল অ্যাকাউন্ট বা লগইন তথ্য থেকে আলাদা।"
              : "This support email and phone number will be displayed on customer invoices and support inquiries. It is independent of your account login credentials."}
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label={isBn ? "সাপোর্ট ইমেইল (ঐচ্ছিক)" : "Support Email (Optional)"}
              type="email"
              value={value("email")}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              placeholder="support@yourshop.com"
            />
            <Field
              label={isBn ? "সাপোর্ট ফোন নম্বর (ঐচ্ছিক)" : "Support Phone (Optional)"}
              value={value("phone")}
              onChange={(event) =>
                setForm({ ...form, phone: event.target.value })
              }
              inputMode="tel"
              placeholder="01XXXXXXXXX"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            {busy ? t("loading") : t("saveChanges")}
          </button>
        </div>
      </form>
    </div>
  );
}
