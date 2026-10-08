"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BadgePercent,
  Banknote,
  ChartNoAxesCombined,
  ClipboardList,
  FileText,
  Flag,
  LayoutDashboard,
  PackageSearch,
  Settings2,
  Store,
  UserRound,
  UsersRound,
  Webhook,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/common/Logo";

const navGroups: {
  key: string;
  items: { key: string; href: string; icon: LucideIcon }[];
}[] = [
  {
    key: "workspace",
    items: [
      { key: "overview", href: "/admin", icon: LayoutDashboard },
      { key: "shops", href: "/admin/shops", icon: Store },
      { key: "users", href: "/admin/users", icon: UsersRound },
      { key: "orders", href: "/admin/orders", icon: PackageSearch },
      { key: "visitors", href: "/admin/visitors", icon: Activity },
    ],
  },
  {
    key: "revenue",
    items: [
      { key: "plans", href: "/admin/plans", icon: BadgePercent },
      { key: "features", href: "/admin/features", icon: Flag },
      { key: "payments", href: "/admin/payments", icon: Banknote },
      { key: "coupons", href: "/admin/coupons", icon: BadgePercent },
    ],
  },
  {
    key: "operations",
    items: [
      { key: "announcements", href: "/admin/announcements", icon: FileText },
      { key: "content", href: "/admin/content", icon: FileText },
      { key: "settings", href: "/admin/settings", icon: Settings2 },
      { key: "system", href: "/admin/system", icon: Webhook },
      { key: "usage", href: "/admin/usage", icon: ChartNoAxesCombined },
      { key: "auditLogs", href: "/admin/audit-logs", icon: ClipboardList },
    ],
  },
];

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const t = useTranslations("admin");

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-5">
        <Logo />
        <span className="ml-auto text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          {t("adminLabel")}
        </span>
      </div>
      <nav
        className="flex-1 space-y-5 overflow-y-auto p-3"
        aria-label={t("navigationLabel")}
      >
        {navGroups.map((group) => (
          <div key={group.key}>
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t(`groups.${group.key}`)}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ key, href, icon: Icon }) => {
                const active =
                  href === "/admin"
                    ? pathname === href
                    : pathname.startsWith(href);
                return (
                  <Link
                    key={key}
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors ${active ? "bg-primary-soft font-semibold text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                  >
                    <Icon size={17} aria-hidden="true" />
                    <span>{t(`nav.${key}`)}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t p-3 text-xs text-muted-foreground">
        <UserRound className="mr-2 inline" size={14} />
        {t("platformConsole")}
      </div>
    </div>
  );
}
