"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { NAV_SECTIONS, getActiveSection } from "@/constants/navigation";
import { useCurrentShop } from "@/hooks/useCurrentShop";
export function SectionSubNav({ sectionKey }: { sectionKey?: string }) {
  const pathname = usePathname();
  const t = useTranslations("step8");
  const { can } = useCurrentShop();
  const section = sectionKey
    ? NAV_SECTIONS.find((item) => item.key === sectionKey)
    : getActiveSection(pathname);
  if (!section || section.subNav.length === 0) return null;
  return (
    <nav className="sticky top-14 z-20 flex gap-1 overflow-x-auto border-b bg-background/95 px-4 backdrop-blur md:px-6">
      {section.subNav
        .filter((item) => !item.permission || can(item.permission))
        .map((item) => {
          const active = item.exact
            ? pathname === item.href ||
              (item.key === "orders" && pathname.startsWith(`${item.href}/`))
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`min-h-11 shrink-0 border-b-2 px-3 pt-2 text-sm ${active ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
            >
              {t(item.labelKey)}
            </Link>
          );
        })}
    </nav>
  );
}
