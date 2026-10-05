"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("common");
  const setLocale = (nextLocale: "bn" | "en") => {
    document.cookie = `bk_locale=${nextLocale}; Max-Age=31536000; Path=/; SameSite=Lax`;
    router.refresh();
  };
  return (
    <div
      className="inline-flex h-9 items-center rounded-full border bg-card p-1 shadow-xs"
      aria-label={t("switchLanguage")}
    >
      <button
        type="button"
        onClick={() => setLocale("bn")}
        className={cn(
          "h-7 rounded-full px-3 text-xs font-semibold transition-colors",
          locale === "bn"
            ? "bg-primary-soft text-primary"
            : "text-muted-foreground hover:text-foreground",
        )}
        aria-pressed={locale === "bn"}
      >
        {compact ? "বাং" : "বাংলা"}
      </button>
      <span className="text-border">|</span>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={cn(
          "h-7 rounded-full px-3 text-xs font-semibold transition-colors",
          locale === "en"
            ? "bg-primary-soft text-primary"
            : "text-muted-foreground hover:text-foreground",
        )}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
    </div>
  );
}
