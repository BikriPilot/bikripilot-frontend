"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { authApi } from "@/lib/api/auth.api";
import { useAuthStore } from "@/stores/authStore";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("common");
  const setLocale = (nextLocale: "bn" | "en") => {
    document.cookie = `bk_locale=${nextLocale}; Max-Age=31536000; Path=/; SameSite=Lax`;
    const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
    if (typeof document !== "undefined" && !document.cookie.includes("bk_theme=")) {
      document.cookie = `bk_theme=${isDark ? "dark" : "light"}; Max-Age=31536000; Path=/; SameSite=Lax`;
    }
    const auth = useAuthStore.getState();
    if (auth.accessToken && auth.user && !auth.user.impersonation) {
      void authApi
        .updateMe({ locale: nextLocale })
        .then((user) => {
          if (useAuthStore.getState().user?.id === user.id) {
            useAuthStore.getState().setUser(user);
          }
        })
        .catch(() => {});
    }
    router.refresh();
    if (typeof window !== "undefined" && process.env.NODE_ENV !== "test") {
      try {
        window.location.reload();
      } catch {}
    }
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
          `h-7 rounded-full ${compact ? "px-2" : "px-3"} text-xs font-semibold transition-colors`,
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
          `h-7 rounded-full ${compact ? "px-2" : "px-3"} text-xs font-semibold transition-colors`,
          locale === "en"
            ? "bg-primary-soft text-primary"
            : "text-muted-foreground hover:text-foreground",
        )}
        aria-pressed={locale === "en"}
      >
        {compact ? "EN" : "English"}
      </button>
    </div>
  );
}
