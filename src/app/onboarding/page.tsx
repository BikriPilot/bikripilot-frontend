"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Field } from "@/components/common/Field";
import { ErrorState } from "@/components/common/PageStates";
import { shopsApi } from "@/lib/api/shops.api";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { toast } from "sonner";
export default function OnboardingPage() {
  const t = useTranslations("step8");
  const router = useRouter();
  const { shopId } = useCurrentShop();
  const query = useQuery({
    queryKey: ["onboarding", shopId],
    queryFn: () => shopsApi.onboarding(shopId!),
    enabled: Boolean(shopId),
  });
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [business, setBusiness] = useState({
    name: "",
    phone: "",
    district: "",
  });
  const [delivery, setDelivery] = useState({
    inside: "",
    sub: "",
    outside: "",
  });
  const keys = [
    "business",
    "delivery",
    "ai",
    "facebook",
    "product",
    "courier",
  ] as const;
  const saveAndNext = async (skip = false) => {
    if (!shopId) return;
    setBusy(true);
    try {
      if (index === 0 && !skip)
        await shopsApi.update(shopId, {
          ...(business.name ? { name: business.name } : {}),
          ...(business.phone ? { phone: business.phone } : {}),
        });
      if (index === 1 && !skip)
        await shopsApi.updateSettings(shopId, {
          ...(delivery.inside
            ? {
                deliveryChargeInsideDhakaPaisa: Math.round(
                  Number(delivery.inside) * 100,
                ),
              }
            : {}),
          ...(delivery.sub
            ? {
                deliveryChargeSubDhakaPaisa: Math.round(
                  Number(delivery.sub) * 100,
                ),
              }
            : {}),
          ...(delivery.outside
            ? {
                deliveryChargeOutsideDhakaPaisa: Math.round(
                  Number(delivery.outside) * 100,
                ),
              }
            : {}),
        });
      if (index === keys.length - 1 || (skip && index === keys.length - 1)) {
        await shopsApi.completeOnboarding(shopId, false);
        router.replace("/dashboard");
      } else setIndex((current) => current + 1);
    } catch {
      toast.error(t("genericError"));
    } finally {
      setBusy(false);
    }
  };
  const current = keys[index];
  if (query.isError)
    return (
      <AuthGuard>
        <ErrorState onRetry={() => void query.refetch()} />
      </AuthGuard>
    );
  return (
    <AuthGuard>
      <main className="mx-auto max-w-2xl">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {index + 1} / {keys.length}
            </p>
            <button
              type="button"
              onClick={() =>
                void shopsApi
                  .completeOnboarding(shopId!, true)
                  .then(() => router.replace("/dashboard"))
              }
              className="text-sm font-semibold text-primary"
            >
              {t("finishLater")}
            </button>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${((index + 1) / keys.length) * 100}%` }}
            />
          </div>
        </div>
        <section className="rounded-2xl border bg-card p-5 sm:p-8">
          <h1 className="text-2xl font-semibold">
            {current === "business"
              ? t("onboardingBusiness")
              : current === "delivery"
                ? t("onboardingDelivery")
                : current === "ai"
                  ? t("onboardingAi")
                  : current === "facebook"
                    ? t("onboardingFacebook")
                    : current === "product"
                      ? t("onboardingProduct")
                      : t("onboardingCourier")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {current === "business"
              ? t("onboardingBusinessDescription")
              : current === "delivery"
                ? t("onboardingDeliveryDescription")
                : current === "ai"
                  ? t("onboardingAiDescription")
                  : current === "facebook"
                    ? t("onboardingFacebookDescription")
                    : current === "product"
                      ? t("onboardingProductDescription")
                      : t("onboardingCourierDescription")}
          </p>
          {current === "business" ? (
            <div className="mt-6 grid gap-4">
              <Field
                label={t("businessName")}
                value={business.name}
                onChange={(event) =>
                  setBusiness({ ...business, name: event.target.value })
                }
              />
              <Field
                label={t("phone")}
                value={business.phone}
                onChange={(event) =>
                  setBusiness({ ...business, phone: event.target.value })
                }
              />
            </div>
          ) : null}
          {current === "delivery" ? (
            <div className="mt-6 grid gap-4">
              <Field
                label={t("insideDhaka")}
                inputMode="decimal"
                value={delivery.inside}
                onChange={(event) =>
                  setDelivery({
                    ...delivery,
                    inside: event.target.value.replace(/[^0-9.]/g, ""),
                  })
                }
              />
              <Field
                label={t("subDhaka")}
                inputMode="decimal"
                value={delivery.sub}
                onChange={(event) =>
                  setDelivery({
                    ...delivery,
                    sub: event.target.value.replace(/[^0-9.]/g, ""),
                  })
                }
              />
              <Field
                label={t("outsideDhaka")}
                inputMode="decimal"
                value={delivery.outside}
                onChange={(event) =>
                  setDelivery({
                    ...delivery,
                    outside: event.target.value.replace(/[^0-9.]/g, ""),
                  })
                }
              />
            </div>
          ) : null}
          {current === "product" ? (
            <Link href="/dashboard/products/new" className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">
              {t("addFirstProduct")}
            </Link>
          ) : null}
          {current === "facebook" ? (
            <Link href="/dashboard/channels" className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">
              {t("connectFacebook")}
            </Link>
          ) : null}
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => void saveAndNext(true)}
              disabled={busy}
              className="min-h-11 rounded-lg border px-4 text-sm font-semibold"
            >
              {t("skip")}
            </button>
            <button
              type="button"
              onClick={() => void saveAndNext()}
              disabled={busy}
              className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              {index === keys.length - 1 ? t("finish") : t("next")}
            </button>
          </div>
        </section>
        {current === "ai" ? (
          <Link
            href="/dashboard"
            className="mt-4 block text-center text-sm text-primary"
          >
            {t("finishLater")}
          </Link>
        ) : null}
      </main>
    </AuthGuard>
  );
}
