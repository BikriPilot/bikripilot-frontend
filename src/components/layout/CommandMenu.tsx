"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const items = [
  ["home", "/dashboard"],
  ["settings", "/dashboard/settings"],
  ["team", "/dashboard/team"],
  ["billing", "/dashboard/billing"],
  ["profile", "/dashboard/profile"],
  ["help", "/dashboard/help"],
  ["addProduct", "/dashboard/products/new"],
  ["newOrder", "/dashboard/orders/new"],
  ["recordGave", "/dashboard/hisab"],
  ["checkPhone", "/dashboard/risk"],
] as const;

export function CommandMenu() {
  const t = useTranslations("step8");
  const router = useRouter();
  const [open, setOpen] = useState(false);

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
        className="hidden h-10 items-center gap-2 rounded-lg border px-3 text-sm text-muted-foreground hover:bg-muted xl:flex"
        aria-label={t("search")}
      >
        <Search size={16} />
        {t("search")}
        <kbd className="rounded bg-muted px-1.5 text-xs">Ctrl K</kbd>
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
            className="mx-auto mt-[12vh] w-full max-w-lg rounded-2xl border bg-card p-3 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b px-2 pb-3">
              <Search className="size-4 text-muted-foreground" />
              <span className="flex-1 text-sm text-muted-foreground">
                {t("search")}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-8 place-items-center rounded-md hover:bg-muted"
                aria-label={t("close")}
              >
                <X className="size-4" />
              </button>
            </div>
            <nav className="mt-2 grid gap-1">
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
            <button type="button" onClick={() => { setOpen(false); router.push("/dashboard/products/new"); }} className="mt-2 w-full rounded-lg border px-3 py-3 text-left text-sm font-medium hover:bg-muted">
              {t("addProduct")}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
