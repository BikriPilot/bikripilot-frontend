"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { authApi } from "@/lib/api/auth.api";
import { runtimeConfig } from "@/config/runtime";
import { useAuthStore } from "@/stores/authStore";

const environment = () => {
  const host = new URL(runtimeConfig.siteUrl).hostname;
  if (host === "localhost" || host === "127.0.0.1") return "local";
  if (host.startsWith("staging.")) return "staging";
  return "production";
};

export function AdminShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const clear = useAuthStore((state) => state.clear);
  const [mobileOpen, setMobileOpen] = useState(false);

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clear();
      router.replace("/login");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r bg-card xl:block">
        <AdminSidebar />
      </aside>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card/95 px-3 backdrop-blur sm:px-5 xl:ml-60">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="grid size-10 place-items-center rounded-md hover:bg-muted xl:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label={t("openMenu")}
          >
            <Menu size={19} />
          </button>
          <span className="hidden text-xs font-semibold uppercase text-muted-foreground sm:block">
            {t("console")}
          </span>
          <span className="rounded-sm border bg-muted px-2 py-1 text-[10px] font-semibold uppercase tracking-wide">
            {t(`environment.${environment()}`)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher compact />
          <button
            type="button"
            onClick={logout}
            className="grid size-10 place-items-center rounded-md text-muted-foreground hover:bg-muted"
            aria-label={t("logout")}
          >
            <LogOut size={17} />
          </button>
        </div>
      </header>
      <div className="xl:ml-60">
        <main className="mx-auto min-h-[calc(100vh-3.5rem)] max-w-[1600px] px-4 py-5 pb-12 sm:px-6 sm:py-7">
          {children}
        </main>
      </div>
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-50 bg-foreground/40 xl:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="absolute inset-y-0 left-0 w-[min(88vw,320px)] bg-card shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="absolute right-2 top-2 z-10">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="grid size-10 place-items-center rounded-md hover:bg-muted"
                aria-label={t("closeMenu")}
              >
                <X size={18} />
              </button>
            </div>
            <AdminSidebar onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      ) : null}
    </div>
  );
}
