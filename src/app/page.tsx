import { ArrowRight, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { Logo } from "@/components/common/Logo";

export default async function Home() {
  const t = await getTranslations("common");
  const nav = await getTranslations("nav");
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_10%,var(--primary-soft),transparent_34%),linear-gradient(145deg,var(--background),var(--muted))]" />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo />
        <LanguageSwitcher />
      </header>
      <section className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:pb-24 lg:pt-20">
        <div className="max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card/80 px-3 py-1 text-sm text-muted-foreground shadow-xs">
            <Sparkles className="size-4 text-primary" />
            {t("brand")}
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
            {t("comingSoon")}
          </h1>
          <p className="mt-5 max-w-lg text-base text-muted-foreground sm:text-lg">
            {t("placeholderDescription")}
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-5 font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
          >
            {t("goToLogin")}
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="relative mx-auto w-full max-w-md rounded-2xl border bg-card/85 p-4 shadow-sm backdrop-blur sm:p-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <p className="text-sm font-semibold">{t("brand")}</p>
              <p className="text-xs text-muted-foreground">{nav("home")}</p>
            </div>
            <div className="size-8 rounded-full bg-primary-soft" />
          </div>
          <div className="grid grid-cols-2 gap-3 py-5">
            <div className="h-24 rounded-xl bg-primary-soft" />
            <div className="h-24 rounded-xl bg-success-soft" />
            <div className="col-span-2 h-32 rounded-xl bg-muted" />
          </div>
        </div>
      </section>
    </main>
  );
}
