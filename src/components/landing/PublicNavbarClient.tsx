"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  Compass,
  FileText,
  Headset,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Scale,
  Trash2,
  X,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Logo } from "@/components/common/Logo";
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/lib/api/auth.api";
import { useAuthStore } from "@/stores/authStore";

const emptySubscribe = () => () => {};

interface NavTranslations {
  navFeatures: string;
  navWorkflows?: string;
  navHow: string;
  navPricing: string;
  navFaq: string;
  navLogin: string;
  startFree: string;
  startTotallyFree: string;
  supportBtn: string;
  navResources: string;
  navTrackOrders: string;
  navContact: string;
  navDataDeletion: string;
  navDashboard?: string;
  navLogout?: string;
}

export function PublicNavbarClient({ t }: { t: NavTranslations }) {
  const { user, isBootstrapping } = useAuth(false);
  const clear = useAuthStore((state) => state.clear);
  const router = useRouter();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);
  const resourcesRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  const isAdmin =
    user?.platformRole === "SUPPORT" || user?.platformRole === "SUPER_ADMIN";
  const dashboardHref =
    isAdmin && (!user?.memberships || user.memberships.length === 0)
      ? "/admin"
      : "/dashboard";

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await authApi.logout();
    } catch {
      // ignore logout network errors
    } finally {
      clear();
      setLoggingOut(false);
      setMobileMenuOpen(false);
      router.refresh();
    }
  };

  // Close menus when route changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setResourcesOpen(false);
      setMobileMenuOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Click outside and escape handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        resourcesRef.current &&
        !resourcesRef.current.contains(e.target as Node)
      ) {
        setResourcesOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setResourcesOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
      if (closeTimeout.current) {
        clearTimeout(closeTimeout.current);
      }
    };
  }, []);

  // Handle mouse hover with snappy opening and smooth grace period
  const handleMouseEnter = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setResourcesOpen(true);
  };

  const handleMouseLeave = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
    }
    closeTimeout.current = setTimeout(() => {
      setResourcesOpen(false);
    }, 120);
  };

  // Resources Mega Menu Items (Image 2 style with Track Orders, Contact, Data Deletion, FAQ, Privacy, Terms)
  const resourcesItems = [
    {
      title: t.navTrackOrders || "Track Orders",
      desc: "Live public order & parcel consignment tracking",
      href: "/track",
      icon: Compass,
      color: "text-emerald-500 bg-emerald-500/10",
      featured: true,
    },
    {
      title: t.navContact || "Support & Contact",
      desc: "24/7 seller assistance, email & WhatsApp desk",
      href: "/contact",
      icon: Headset,
      color: "text-primary bg-primary/10",
      featured: true,
    },
    {
      title: t.navDataDeletion || "Data Deletion Request",
      desc: "Meta Facebook user data removal compliance",
      href: "/data-deletion",
      icon: Trash2,
      color: "text-rose-500 bg-rose-500/10",
      featured: true,
    },
    {
      title: t.navFaq || "FAQ & Help Center",
      desc: "Frequently asked questions & setup guides",
      href: "/faq",
      icon: HelpCircle,
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      title: "Privacy Policy",
      desc: "Meta Graph API & AES-256 data protection",
      href: "/privacy",
      icon: FileText,
      color: "text-amber-500 bg-amber-500/10",
    },
    {
      title: "Terms of Service",
      desc: "Platform rules & merchant guidelines",
      href: "/terms",
      icon: Scale,
      color: "text-purple-500 bg-purple-500/10",
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        {/* Brand Logo */}
        <Logo />

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 text-sm font-medium lg:flex">
          {/* 1. Features Link */}
          <Link
            href="/features"
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t.navFeatures}
          </Link>

          {/* 2. Workflows Link (/how-it-works) */}
          <Link
            href="/how-it-works"
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t.navWorkflows || "Workflows"}
          </Link>

          {/* 3. Resources Mega Menu Dropdown */}
          <div
            ref={resourcesRef}
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (closeTimeout.current) {
                  clearTimeout(closeTimeout.current);
                  closeTimeout.current = null;
                }
                setResourcesOpen((prev) => !prev);
              }}
              aria-expanded={resourcesOpen}
              aria-haspopup="true"
              className={`flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-150 ${
                resourcesOpen
                  ? "bg-muted text-foreground ring-1 ring-border/50"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <span>{t.navResources || "Resources"}</span>
              <ChevronDown
                className={`size-3.5 transition-transform duration-200 ease-out ${
                  resourcesOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Mega Menu Floating Card with smooth fast transition */}
            <div
              className={`absolute left-1/2 top-full z-50 w-[720px] -translate-x-1/2 pt-2 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                resourcesOpen
                  ? "pointer-events-auto visible opacity-100 translate-y-0 scale-100"
                  : "pointer-events-none invisible opacity-0 -translate-y-2 scale-[0.98]"
              }`}
              role="region"
              aria-label={t.navResources || "Resources"}
            >
              {/* Invisible bridge element ensuring no gap between button and card */}
              <div
                className="absolute -top-3 left-0 right-0 h-4"
                aria-hidden="true"
              />

              <div className="rounded-2xl border border-border/80 bg-card/95 p-5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.35)] backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10">
                <div className="grid grid-cols-3 gap-2.5">
                  {resourcesItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setResourcesOpen(false)}
                        className={`group flex flex-col justify-between rounded-xl p-3 transition-all duration-150 hover:bg-muted/80 hover:-translate-y-0.5 active:translate-y-0 ${
                          item.featured
                            ? "bg-muted/30 border border-border/50"
                            : "hover:border hover:border-border/40 border border-transparent"
                        }`}
                      >
                        <div>
                          <div
                            className={`grid size-8 shrink-0 place-items-center rounded-lg mb-2.5 transition-transform duration-200 group-hover:scale-110 ${item.color}`}
                          >
                            <Icon className="size-4" />
                          </div>
                          <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                            {item.title}
                          </p>
                          <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                            {item.desc}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                  <span className="text-muted-foreground">
                    Need custom setup assistance?
                  </span>
                  <Link
                    href="/contact"
                    onClick={() => setResourcesOpen(false)}
                    className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                  >
                    <Headset className="size-3.5" />
                    <span>{t.supportBtn || "Support"} Desk →</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Pricing Link */}
          <Link
            href="/pricing"
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t.navPricing}
          </Link>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher & Theme Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <LanguageSwitcher compact />
            <ThemeToggle />
          </div>

          {/* PC Action Buttons */}
          {!mounted || isBootstrapping ? (
            <div className="hidden h-10 w-28 animate-pulse rounded-xl bg-muted/60 sm:block" />
          ) : user ? (
            <div className="hidden items-center gap-2 border-l border-border/70 pl-3 sm:flex lg:gap-2.5">
              <Link
                href={dashboardHref}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md"
              >
                <LayoutDashboard className="size-4" />
                <span>{t.navDashboard || "Dashboard"}</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                title={t.navLogout || "Log out"}
                aria-label={t.navLogout || "Log out"}
                className="grid size-10 place-items-center rounded-xl border border-border/70 bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                <LogOut className="size-4.5" />
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 border-l border-border/70 pl-3 sm:flex lg:gap-3">
              <Link
                href="/login"
                className="inline-flex min-h-10 items-center px-3.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                {t.navLogin}
              </Link>

              <Link
                href="/register"
                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-primary px-4.5 text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md"
              >
                <span>{t.startFree}</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile navigation menu"
            className="grid size-10 place-items-center rounded-xl border bg-card text-foreground transition-colors hover:bg-muted lg:hidden"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="border-b bg-card/98 px-5 py-5 shadow-2xl backdrop-blur-xl lg:hidden max-h-[85vh] overflow-y-auto animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-4">
            {/* Quick Action Buttons for Mobile */}
            {user ? (
              <div className="grid grid-cols-[1fr_auto] gap-2 border-b pb-4">
                <Link
                  href={dashboardHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground shadow-xs"
                >
                  <LayoutDashboard className="size-4" />
                  <span>{t.navDashboard || "Dashboard"}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  title={t.navLogout || "Log out"}
                  aria-label={t.navLogout || "Log out"}
                  className="grid size-10 place-items-center rounded-xl border bg-card text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                >
                  <LogOut className="size-4.5" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 border-b pb-4">
                <Link
                  href="/login"
                  className="rounded-xl border py-2.5 text-center text-sm font-semibold hover:bg-muted"
                >
                  {t.navLogin}
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground shadow-xs"
                >
                  {t.startFree}
                </Link>
              </div>
            )}

            {/* Direct Links */}
            <div className="space-y-1">
              <Link
                href="/features"
                className="block rounded-lg px-2 py-2 text-sm font-semibold text-foreground hover:bg-muted"
              >
                {t.navFeatures}
              </Link>
              <Link
                href="/how-it-works"
                className="block rounded-lg px-2 py-2 text-sm font-semibold text-foreground hover:bg-muted"
              >
                {t.navWorkflows || "Workflows"}
              </Link>
              <Link
                href="/pricing"
                className="block rounded-lg px-2 py-2 text-sm font-semibold text-foreground hover:bg-muted"
              >
                {t.navPricing}
              </Link>
            </div>

            {/* Accordion: Resources (Data Deletion, Track Orders, Contact) */}
            <div className="border-t pt-3">
              <button
                type="button"
                onClick={() => setMobileResourcesOpen(!mobileResourcesOpen)}
                className="flex w-full items-center justify-between py-2 text-sm font-bold text-foreground"
              >
                <span>{t.navResources || "Resources"}</span>
                <ChevronDown
                  className={`size-4 transition-transform ${
                    mobileResourcesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {mobileResourcesOpen && (
                <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-primary/30">
                  {resourcesItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-2.5 rounded-lg p-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Icon className="size-4 text-primary" />
                        <span>{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
