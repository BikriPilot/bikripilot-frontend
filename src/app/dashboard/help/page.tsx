import { getTranslations } from "next-intl/server";
import Link from "next/link";
export default async function HelpPage() {
  const t = await getTranslations("help");
  const destinations = {
    connect: "/dashboard/channels",
    ai: "/dashboard/ai/settings",
    courier: "/dashboard/couriers",
    reconciliation: "/dashboard/reconciliation",
  };
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("description")}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {(["connect", "ai", "courier", "reconciliation"] as const).map(
          (key) => (
            <article key={key} className="rounded-xl border bg-card p-5">
              <h2 className="font-semibold">{t(`guides.${key}.title`)}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {t(`guides.${key}.body`)}
              </p>
              <Link
                href={destinations[key]}
                className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-primary"
              >
                {t(`guides.${key}.title`)}
              </Link>
            </article>
          ),
        )}
      </div>
      <Link
        href="/faq"
        className="inline-flex min-h-11 items-center font-semibold text-primary"
      >
        {t("faqLink")}
      </Link>
      <div className="rounded-xl border bg-primary-soft p-5">
        <h2 className="font-semibold">{t("contactTitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("contactBody")}</p>
        <Link
          href="/contact"
          className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          {t("contactAction")}
        </Link>
      </div>
    </div>
  );
}
