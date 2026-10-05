import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function NotFound() {
  const t = await getTranslations("common");
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="text-sm font-semibold text-primary">404</p>
        <h1 className="mt-3 text-3xl font-semibold">{t("notFoundTitle")}</h1>
        <p className="mt-3 text-muted-foreground">{t("notFoundDescription")}</p>
        <Link
          className="mt-6 inline-flex h-11 items-center rounded-lg bg-primary px-5 font-semibold text-primary-foreground"
          href="/"
        >
          {t("backHome")}
        </Link>
      </div>
    </main>
  );
}
