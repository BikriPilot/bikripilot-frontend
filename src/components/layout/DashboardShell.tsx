"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Store,
  UserCircle,
  X,
} from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { NAV_FOOTER_ITEMS, NAV_SECTIONS } from "@/constants/navigation";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { Logo } from "@/components/common/Logo";
import { SectionSubNav } from "./SectionSubNav";
import { CommandMenu } from "./CommandMenu";
import { UpgradeDialog } from "./UpgradeDialog";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { useAuthStore } from "@/stores/authStore";
import { authApi } from "@/lib/api/auth.api";
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("step8");
  const { shop } = useCurrentShop();
  const clear = useAuthStore((state) => state.clear);
  const [moreOpen, setMoreOpen] = useState(false);
  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clear();
      router.replace("/login");
    }
  };
  const sections = NAV_SECTIONS;
  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r bg-card md:block xl:w-60">
        <div className="flex h-14 items-center border-b px-5">
          <Logo />
        </div>
        <nav className="space-y-1 p-3 md:xl:p-3">
          {sections.map(({ href, icon: Icon, key, labelKey }) => (
            <Link
              key={key}
              href={href}
              title={t(labelKey)}
              className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm ${isActive(href) ? "bg-primary-soft font-semibold text-primary" : "text-muted-foreground hover:bg-muted"}`}
            >
              <Icon size={18} />
              {t(labelKey)}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 left-3 right-3">
          {NAV_FOOTER_ITEMS.map(({ href, icon: Icon, key, labelKey }) => (
            <Link
              key={key}
              href={href}
              className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground hover:bg-muted"
            >
              <Icon size={18} />
              {t(labelKey)}
            </Link>
          ))}
          <Link
            href="/dashboard/profile"
            className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground hover:bg-muted"
          >
            <UserCircle size={18} />
            {t("profile")}
          </Link>
        </div>
      </aside>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card/95 px-4 backdrop-blur md:ml-60">
        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <Logo compact />
          </div>
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="grid size-10 place-items-center rounded-lg hover:bg-muted md:hidden"
            aria-label={t("openMenu")}
          >
            <Menu size={19} />
          </button>
          <CommandMenu />
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg px-2 text-sm font-medium hover:bg-muted"
          >
            <Store size={16} />
            {shop?.shopName ?? t("chooseShop")}
            <ChevronDown size={15} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher compact />
          <Link
            href="/dashboard/notifications"
            className="grid size-10 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
            aria-label={t("notifications")}
          >
            <Bell size={18} />
          </Link>
          <Link
            href="/dashboard/profile"
            className="hidden size-10 place-items-center rounded-full bg-primary-soft text-primary sm:grid"
            aria-label={t("profile")}
          >
            <UserCircle size={20} />
          </Link>
          <button
            type="button"
            onClick={logout}
            className="hidden size-10 place-items-center rounded-lg text-muted-foreground hover:bg-muted sm:grid"
            aria-label={t("logout")}
          >
            <LogOut size={17} />
          </button>
        </div>
      </header>
      <div className="md:ml-60">
        <SectionSubNav />
        <main className="mx-auto max-w-[1440px] p-4 pb-24 md:p-6 md:pb-8">
          {children}
        </main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t bg-card pb-[env(safe-area-inset-bottom)] md:hidden">
        {sections
          .filter((section) => section.mobile === "bottom")
          .map(({ href, icon: Icon, key, labelKey }) => (
            <Link
              key={key}
              href={href}
              className={`grid min-h-16 place-items-center gap-0.5 text-[11px] ${isActive(href) ? "text-primary" : "text-muted-foreground"}`}
            >
              <Icon size={19} />
              {t(labelKey)}
            </Link>
          ))}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className="grid min-h-16 place-items-center gap-0.5 text-[11px] text-muted-foreground"
        >
          <Menu size={19} />
          {t("more")}
        </button>
      </nav>
      {moreOpen ? (
        <div
          className="fixed inset-0 z-50 bg-foreground/30 xl:hidden"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="absolute inset-y-0 right-0 w-[min(88vw,360px)] bg-card p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold">{t("more")}</p>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="grid size-10 place-items-center rounded-lg hover:bg-muted"
                aria-label={t("close")}
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-5 grid gap-1">
              {sections
                .filter((section) => section.mobile === "more")
                .map(({ href, icon: Icon, key, labelKey }) => (
                  <Link
                    key={key}
                    href={href}
                    onClick={() => setMoreOpen(false)}
                    className="flex min-h-12 items-center gap-3 rounded-lg px-3 hover:bg-muted"
                  >
                    <Icon size={18} />
                    {t(labelKey)}
                  </Link>
                ))}
              {NAV_FOOTER_ITEMS.map(({ href, icon: Icon, key, labelKey }) => (
                <Link
                  key={key}
                  href={href}
                  onClick={() => setMoreOpen(false)}
                  className="flex min-h-12 items-center gap-3 rounded-lg px-3 hover:bg-muted"
                >
                  <Icon size={18} />
                  {t(labelKey)}
                </Link>
              ))}
              <Link
                href="/dashboard/profile"
                onClick={() => setMoreOpen(false)}
                className="flex min-h-12 items-center gap-3 rounded-lg px-3 hover:bg-muted"
              >
                <UserCircle size={18} />
                {t("profile")}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="flex min-h-12 items-center gap-3 rounded-lg px-3 text-danger hover:bg-danger-soft"
              >
                <LogOut size={18} />
                {t("logout")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <UpgradeDialog />
    </div>
  );
}
