import { Menu, X } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { Logo } from "@/components/common/Logo";
export async function PublicNavbar() {
  const t = await getTranslations("landing");
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground lg:flex">
          <Link href="/#features" className="hover:text-foreground">
            {t("navFeatures")}
          </Link>
          <Link href="/#how-it-works" className="hover:text-foreground">
            {t("navHow")}
          </Link>
          <Link href="/pricing" className="hover:text-foreground">
            {t("navPricing")}
          </Link>
          <Link href="/#faq" className="hover:text-foreground">
            {t("navFaq")}
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher compact />
          <div className="hidden items-center gap-2 sm:flex">
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center px-3 text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              {t("navLogin")}
            </Link>
            <Link
              href="/register"
              className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm"
            >
              {t("startFree")}
            </Link>
          </div>
          <details className="relative lg:hidden">
            <summary className="grid size-11 list-none cursor-pointer place-items-center rounded-lg border [&::-webkit-details-marker]:hidden">
              <Menu className="size-5" />
              <X className="hidden size-5 [[open]>&]:block" />
            </summary>
            <div className="absolute right-0 top-14 w-64 rounded-xl border bg-card p-3 shadow-lg">
              <nav className="grid gap-1 text-sm">
                <Link
                  href="/#features"
                  className="rounded-lg px-3 py-3 hover:bg-muted"
                >
                  {t("navFeatures")}
                </Link>
                <Link
                  href="/#how-it-works"
                  className="rounded-lg px-3 py-3 hover:bg-muted"
                >
                  {t("navHow")}
                </Link>
                <Link
                  href="/pricing"
                  className="rounded-lg px-3 py-3 hover:bg-muted"
                >
                  {t("navPricing")}
                </Link>
                <Link
                  href="/#faq"
                  className="rounded-lg px-3 py-3 hover:bg-muted"
                >
                  {t("navFaq")}
                </Link>
              </nav>
              <div className="mt-2 grid gap-2 border-t pt-3 sm:hidden">
                <Link
                  href="/login"
                  className="rounded-lg px-3 py-3 font-semibold hover:bg-muted"
                >
                  {t("navLogin")}
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-primary px-3 py-3 text-center font-semibold text-primary-foreground"
                >
                  {t("startFree")}
                </Link>
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
