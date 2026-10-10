"use client";
import { getActiveSection } from "@/constants/navigation";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Store,
  UserCircle,
  X,
} from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { NotificationBell } from "./NotificationBell";
import { useShopStore } from "@/stores/shopStore";
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("step8");
  const { shop, can } = useCurrentShop();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const clear = useAuthStore((state) => state.clear);
  const [moreOpen, setMoreOpen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clear();
      router.replace("/login");
    }
  };
  const sections = NAV_SECTIONS.filter(
    (section) => !section.permission || can(section.permission),
  );
  const isChatThreadMobile = Boolean(
    pathname &&
    pathname.startsWith("/dashboard/inbox/") &&
    pathname !== "/dashboard/inbox",
  );
  const isPrint =
    pathname.includes("/print") ||
    pathname.startsWith("/dashboard/hisab/statement/");
  const activeSection = getActiveSection(pathname, sections);
  const isActive = (href: string) => activeSection?.href === href;
  if (isPrint)
    return <div className="min-h-screen bg-background">{children}</div>;
  return (
    <div className="min-h-screen bg-background">
      <aside
        id="seller-sidebar"
        className={`fixed inset-y-0 left-0 z-30 hidden w-60 border-r bg-card ${sidebarVisible ? "md:block" : ""}`}
      >
        <div className="flex h-14 items-center justify-between gap-2 border-b px-4">
          <Logo />
          <button
            type="button"
            onClick={() => setSidebarVisible(false)}
            aria-label={t("hideSidebar")}
            title={t("hideSidebar")}
            aria-controls="seller-sidebar"
            aria-expanded={sidebarVisible}
            className="grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
          >
            <PanelLeftClose size={18} />
          </button>
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
              <span className="flex-1">{t(labelKey)}</span>
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
      <header
        className={`sticky top-0 z-30 h-14 items-center justify-between border-b bg-card/95 px-4 backdrop-blur ${sidebarVisible ? "md:ml-60" : ""} ${
          isChatThreadMobile ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="flex min-w-0 items-center gap-1 md:gap-3">
          {!sidebarVisible && (
            <button
              type="button"
              onClick={() => setSidebarVisible(true)}
              aria-label={t("showSidebar")}
              title={t("showSidebar")}
              aria-controls="seller-sidebar"
              aria-expanded={sidebarVisible}
              className="hidden size-10 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted md:grid"
            >
              <PanelLeftOpen size={19} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="grid size-10 place-items-center rounded-lg hover:bg-muted md:hidden"
            aria-label={t("openMenu")}
          >
            <Menu size={19} />
          </button>
          <CommandMenu />
          <label className="flex min-w-0 items-center gap-2">
            <Store size={16} className="hidden shrink-0 md:block" />
            <select
              aria-label={t("chooseShop")}
              value={shop?.shopId ?? ""}
              onChange={(event) => {
                useShopStore.getState().setCurrentShopId(event.target.value);
                queryClient.clear();
                router.push("/dashboard");
              }}
              className="h-11 w-20 min-w-0 rounded-lg bg-transparent text-sm md:w-auto md:max-w-60"
            >
              {user?.memberships.map((membership) => (
                <option key={membership.shopId} value={membership.shopId}>
                  {membership.shopName}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex shrink-0 items-center gap-1 md:gap-2">
          <LanguageSwitcher compact />
          <NotificationBell />
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
      <div className={sidebarVisible ? "md:ml-60" : ""}>
        {!isChatThreadMobile && <SectionSubNav />}
        <main
          className={`mx-auto max-w-[1440px] ${
            isChatThreadMobile
              ? "p-0 pb-0 h-dvh md:h-auto md:p-6 md:pb-8"
              : "p-4 pb-24 md:p-6 md:pb-8"
          }`}
        >
          {children}
        </main>
      </div>
      <nav
        className={`fixed inset-x-0 bottom-0 z-30 grid-cols-5 border-t bg-card pb-[env(safe-area-inset-bottom)] md:hidden ${
          isChatThreadMobile ? "hidden" : "grid"
        }`}
      >
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
