"use client";

import { useTranslations } from "next-intl";
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <h1 className="text-3xl font-semibold">{t("errorTitle")}</h1>
        <button
          className="mt-6 h-11 rounded-lg bg-primary px-5 font-semibold text-primary-foreground"
          onClick={reset}
        >
          {t("retry")}
        </button>
      </div>
    </main>
  );
}
