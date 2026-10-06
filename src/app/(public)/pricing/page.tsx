import { getTranslations } from "next-intl/server";
import { PricingComparison } from "@/components/landing/PricingComparison";
import { publicServerApi } from "@/lib/api/public.api";
export default async function PricingPage() {
  const [t, plans] = await Promise.all([
    getTranslations("pricing"),
    publicServerApi.getPlans(),
  ]);
  return (
    <main className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          {t("eyebrow")}
        </p>
        <h1 className="mt-3 text-4xl font-semibold">{t("title")}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{t("description")}</p>
      </div>
      <PricingComparison plans={plans} />
      <div className="mt-16 rounded-2xl border bg-muted/50 p-6">
        <h2 className="text-2xl font-semibold">{t("billingTitle")}</h2>
        <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
          {t("billingBody")}
        </p>
      </div>
    </main>
  );
}
