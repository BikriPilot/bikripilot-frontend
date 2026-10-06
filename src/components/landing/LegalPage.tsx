import { getTranslations } from "next-intl/server";

export async function LegalPage({ kind }: { kind: "privacy" | "terms" }) {
  const t = await getTranslations("legal");
  const sections = [
    "account",
    "shopData",
    "network",
    "analytics",
    "ai",
    "facebook",
    "deletion",
  ] as const;
  return (
    <main className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-primary">
        Bikrio
      </p>
      <h1 className="mt-3 text-4xl font-semibold">{t(`${kind}.title`)}</h1>
      <p className="mt-4 text-sm text-muted-foreground">{t("reviewNote")}</p>
      <div className="mt-10 space-y-8">
        {sections.map((section) => (
          <section key={section}>
            <h2 className="text-xl font-semibold">
              {t(`${kind}.${section}.title`)}
            </h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              {t(`${kind}.${section}.body`)}
            </p>
          </section>
        ))}
      </div>
    </main>
  );
}
