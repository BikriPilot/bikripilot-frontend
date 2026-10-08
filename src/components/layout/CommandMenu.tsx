"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { NAV_SECTIONS } from "@/constants/navigation";
import { useCurrentShop } from "@/hooks/useCurrentShop";

const actions = [
  ["profile", "/dashboard/profile", null],
  ["help", "/dashboard/help", null],
  ["addProduct", "/dashboard/products/new", "product.write"],
  ["newOrder", "/dashboard/orders/new", "order.write"],
  ["recordGave", "/dashboard/hisab", "hisab.write"],
  ["checkPhone", "/dashboard/risk", "risk.check"],
] as const;

export function CommandMenu() {
  const t = useTranslations("step8");
  const { can } = useCurrentShop();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const pages = NAV_SECTIONS.filter(
    (section) => !section.permission || can(section.permission),
  ).flatMap((section) =>
    section.subNav.length
      ? section.subNav
          .filter((item) => !item.permission || can(item.permission))
          .map((item) => [item.labelKey, item.href] as const)
      : [[section.labelKey, section.href] as const],
  );
  const items = [
    ...pages,
    ...actions.filter(([, , permission]) => !permission || can(permission)),
  ].filter(([key]) =>
    t(key).toLocaleLowerCase().includes(search.toLocaleLowerCase()),
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 items-center gap-2 rounded-lg border px-3 text-sm text-muted-foreground hover:bg-muted"
        aria-label={t("search")}
      >
        <Search size={16} />
        <span className="hidden xl:inline">{t("search")}</span>
        <kbd className="hidden rounded bg-muted px-1.5 text-xs xl:inline">
          Ctrl K
        </kbd>
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 bg-foreground/30 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("search")}
            className="mx-auto mt-[12vh] w-full max-w-lg rounded-lg border bg-card p-3 shadow-sm"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b px-2 pb-3">
              <Search className="size-4 text-muted-foreground" />
              <input
                autoFocus
                aria-label={t("search")}
                placeholder={t("search")}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-11 min-w-0 flex-1 bg-transparent text-base outline-none"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-8 place-items-center rounded-md hover:bg-muted"
                aria-label={t("close")}
              >
                <X className="size-4" />
              </button>
            </div>
            <nav className="mt-2 grid max-h-[60vh] gap-1 overflow-y-auto">
              {items.map(([key, href]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted"
                >
                  {t(key)}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
