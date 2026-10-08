import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  ChevronDown,
  ClipboardList,
  ListChecks,
  MessageCircle,
  MessageSquareText,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  WalletCards,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { publicServerApi } from "@/lib/api/public.api";
import type { SiteContent } from "@/types/content";
import type { PublicPlan } from "@/types/plan";
import { formatMoney } from "@/lib/money";

const localized = (locale: string, bn: string | null, en: string | null) =>
  locale === "bn" ? bn || en || "" : en || bn || "";

export async function LandingPage() {
  const [locale, t, config, plans, faq, testimonials] = await Promise.all([
    getLocale(),
    getTranslations("landing"),
    publicServerApi.getConfig(),
    publicServerApi.getPlans(),
    publicServerApi.getContent("FAQ"),
    publicServerApi.getContent("TESTIMONIAL"),
  ]);
  const features = [
    Bot,
    ClipboardList,
    PackageCheck,
    ShieldCheck,
    WalletCards,
    UsersRound,
    MessageSquareText,
    ListChecks,
    BarChart3,
  ];
  const featureKeys = [
    "inbox",
    "orders",
    "courier",
    "risk",
    "ledger",
    "team",
    "comments",
    "automation",
    "reports",
  ] as const;
  return (
    <main className="overflow-hidden">
      <section className="relative border-b bg-[radial-gradient(circle_at_75%_20%,var(--primary-soft),transparent_38%),linear-gradient(135deg,var(--background),var(--muted))]">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
          <div className="relative z-10">
            {config?.freeLaunchMode ? (
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-card/80 px-3 py-1.5 text-sm font-semibold text-primary">
                <Sparkles className="size-4" />
                {t("launchBadge")}
              </div>
            ) : null}
            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              {t("heroDescription")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary px-5 font-semibold text-primary-foreground shadow-sm"
              >
                {t("startFree")}
                <ArrowRight className="size-4" />
              </Link>
              {config?.heroVideoUrl ? (
                <a
                  href={config.heroVideoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center rounded-lg border bg-card px-5 font-semibold"
                >
                  {t("watchDemo")}
                </a>
              ) : null}
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              {t("trustLine")}
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-8 -z-10 rounded-full bg-primary/10 blur-3xl" />
            <div className="rounded-[2rem] border bg-card p-4 shadow-xl sm:p-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="font-semibold">{t("mockInbox")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("mockCustomer")}
                  </p>
                </div>
                <div className="grid size-10 place-items-center rounded-full bg-primary-soft text-primary">
                  <MessageCircle className="size-5" />
                </div>
              </div>
              <div className="space-y-3 py-5 text-sm">
                <div className="ml-auto max-w-[82%] rounded-2xl rounded-br-sm bg-muted p-3">
                  {t("mockQuestion")}
                </div>
                <div className="max-w-[88%] rounded-2xl rounded-bl-sm bg-primary-soft p-3 text-foreground">
                  <span className="mb-1 block text-xs font-semibold text-primary">
                    AI
                  </span>
                  {t("mockReply")}
                </div>
              </div>
              <div className="rounded-xl border bg-background p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {t("mockOrder")}
                  </span>
                  <span className="rounded-full bg-success-soft px-2 py-1 text-xs font-semibold text-success">
                    {t("mockReady")}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-semibold">{t("mockProduct")}</span>
                  <span className="font-semibold">৳1,250</span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <PackageCheck className="size-4 text-success" />
                  {t("mockBooked")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-5 py-6 text-sm font-semibold text-muted-foreground sm:px-8">
          <span>{t("worksWith")}</span>
          <span>Facebook Messenger</span>
          <span>Steadfast</span>
          <span>Pathao</span>
          <span>RedX</span>
          <span>bKash</span>
          <span>Nagad</span>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            {t("problemEyebrow")}
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            {t("problemTitle")}
          </h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(
            ["night", "price", "copy", "returns", "money", "notebook"] as const
          ).map((key) => (
            <div key={key} className="rounded-xl border bg-card p-5">
              <h3 className="font-semibold">{t(`problems.${key}.title`)}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {t(`problems.${key}.body`)}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section id="features" className="bg-muted/50">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              {t("featureEyebrow")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              {t("featureTitle")}
            </h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featureKeys.map((key, index) => {
              const Icon = features[index];
              return (
                <div key={key} className="rounded-xl border bg-card p-5">
                  <Icon className="size-6 text-primary" />
                  <h3 className="mt-5 font-semibold">
                    {t(`features.${key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {t(`features.${key}.body`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section
        id="how-it-works"
        className="mx-auto max-w-7xl px-5 py-20 sm:px-8"
      >
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            {t("howEyebrow")}
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            {t("howTitle")}
          </h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {(["connect", "catalogue", "reply", "deliver"] as const).map(
            (key, index) => (
              <div
                key={key}
                className="relative border-l-2 border-primary/20 pl-5 md:border-l-0 md:border-t-2 md:pl-0 md:pt-5"
              >
                <span className="text-3xl font-bold text-primary">
                  0{index + 1}
                </span>
                <h3 className="mt-3 font-semibold">
                  {t(`steps.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {t(`steps.${key}.body`)}
                </p>
              </div>
            ),
          )}
        </div>
      </section>
      <section className="bg-foreground text-background">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold text-primary-soft">
              {t("workflowEyebrow")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              {t("workflowTitle")}
            </h2>
            <p className="mt-5 max-w-xl leading-7 text-background/70">
              {t("workflowBody")}
            </p>
          </div>
          <div className="grid gap-3 text-sm">
            <div className="rounded-xl border border-background/10 bg-background/5 p-4">
              {t("workflowMessage")}
            </div>
            <div className="ml-8 rounded-xl border border-primary/40 bg-primary/15 p-4">
              <span className="text-xs font-semibold text-primary-soft">
                AI
              </span>
              <p className="mt-1">{t("workflowReply")}</p>
            </div>
            <div className="mr-8 rounded-xl border border-success/40 bg-success/10 p-4">
              <div className="flex items-center justify-between">
                <span>{t("workflowOrder")}</span>
                <Check className="size-4 text-success" />
              </div>
              <p className="mt-1 text-background/70">{t("workflowBooked")}</p>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="rounded-2xl border bg-success-soft p-7">
            <p className="text-sm font-semibold text-success">
              {t("ledgerEyebrow")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold">{t("ledgerTitle")}</h2>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-card p-4">
                <p className="text-sm text-muted-foreground">{t("youGet")}</p>
                <p className="mt-2 text-2xl font-semibold text-success">
                  ৳24,500
                </p>
              </div>
              <div className="rounded-xl bg-card p-4">
                <p className="text-sm text-muted-foreground">{t("youGive")}</p>
                <p className="mt-2 text-2xl font-semibold text-danger">
                  ৳8,200
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-lg bg-danger-soft px-3 py-2 text-sm font-semibold text-danger">
                {t("gaveAction")}
              </span>
              <span className="rounded-lg bg-success-soft px-3 py-2 text-sm font-semibold text-success">
                {t("gotAction")}
              </span>
              <span className="rounded-lg border px-3 py-2 text-sm font-semibold">
                {t("reminderAction")}
              </span>
            </div>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              {[1, 2, 3].map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" />
                  {t(`ledgerPoints.${item}`)}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid content-center gap-4">
            {(["without", "with"] as const).map((key) => (
              <div key={key} className="rounded-xl border p-5">
                <h3 className="font-semibold">
                  {t(`comparison.${key}.title`)}
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <li key={item} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      {t(`comparison.${key}.item${item}`)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
      <PricingSection
        locale={locale}
        plans={plans}
        launch={Boolean(config?.freeLaunchMode)}
        t={t}
      />
      {config?.showTestimonials && testimonials.length > 0 ? (
        <section className="bg-muted/50">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
            <h2 className="text-3xl font-semibold">{t("testimonialsTitle")}</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {testimonials.map((item) => (
                <Testimonial key={item.id} item={item} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <section id="faq" className="mx-auto max-w-4xl px-5 py-20 sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          {t("faqEyebrow")}
        </p>
        <h2 className="mt-3 text-3xl font-semibold">{t("faqTitle")}</h2>
        <div className="mt-8 divide-y rounded-xl border bg-card">
          {(faq.length ? faq : defaultFaq(t)).map((item) => (
            <details
              key={"id" in item ? item.id : item.question}
              className="group p-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                <span>
                  {"question" in item
                    ? item.question
                    : localized(locale, item.titleBn, item.titleEn)}
                </span>
                <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {"answer" in item
                  ? item.answer
                  : localized(locale, item.bodyBn, item.bodyEn)}
              </p>
            </details>
          ))}
        </div>
      </section>
      <section className="border-t bg-primary">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-14 text-primary-foreground sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold">{t("finalTitle")}</h2>
            <p className="mt-2 text-primary-foreground/80">{t("finalBody")}</p>
          </div>
          <Link
            href="/register"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-card px-5 font-semibold text-foreground"
          >
            {t("startFree")}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

function PricingSection({
  locale,
  plans,
  launch,
  t,
}: {
  locale: string;
  plans: PublicPlan[];
  launch: boolean;
  t: (key: string) => string;
}) {
  return (
    <section id="pricing" className="bg-muted/50">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              {t("pricingEyebrow")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold">{t("pricingTitle")}</h2>
          </div>
          <Link href="/pricing" className="text-sm font-semibold text-primary">
            {t("comparePlans")} <ArrowRight className="inline size-4" />
          </Link>
        </div>
        {launch ? (
          <div className="mt-8 rounded-xl border border-primary/20 bg-primary-soft p-4 text-sm font-semibold text-primary">
            {t("launchPricing")}
          </div>
        ) : null}
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl border bg-card p-6 ${plan.isHighlighted ? "border-primary ring-2 ring-primary/15" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-xl font-semibold">
                  {localized(locale, plan.nameBn, plan.nameEn)}
                </h3>
                {plan.isHighlighted ? (
                  <span className="rounded-full bg-primary-soft px-2 py-1 text-xs font-semibold text-primary">
                    {t("popular")}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 min-h-12 text-sm text-muted-foreground">
                {localized(locale, plan.descriptionBn, plan.descriptionEn)}
              </p>
              <p className="mt-6 text-3xl font-semibold">
                {formatMoney(plan.priceMonthlyPaisa)}
                <span className="text-sm font-normal text-muted-foreground">
                  {t("perMonth")}
                </span>
              </p>
              <Link
                href="/register"
                className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
              >
                {t("startFree")}
              </Link>
              <ul className="mt-6 space-y-3 text-sm">
                {plan.features
                  .filter((feature) => feature.enabled)
                  .slice(0, 5)
                  .map((feature) => (
                    <li key={feature.key} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" />
                      {localized(locale, feature.nameBn, feature.nameEn)}
                      {feature.unlimited
                        ? ` - ${t("unlimited")}`
                        : feature.limit !== null
                          ? ` - ${feature.limit}`
                          : ""}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function Testimonial({ item, locale }: { item: SiteContent; locale: string }) {
  return (
    <figure className="rounded-xl border bg-card p-5">
      <blockquote className="text-sm leading-6">
        “{localized(locale, item.bodyBn, item.bodyEn)}”
      </blockquote>
      <figcaption className="mt-4 text-sm font-semibold">
        {item.authorName || localized(locale, item.titleBn, item.titleEn)}
        {item.authorRole ? (
          <span className="block text-xs font-normal text-muted-foreground">
            {item.authorRole}
          </span>
        ) : null}
      </figcaption>
    </figure>
  );
}
function defaultFaq(t: (key: string) => string) {
  return [1, 2, 3, 4, 5, 6, 7, 8].map((index) => ({
    question: t(`faqItems.${index}.question`),
    answer: t(`faqItems.${index}.answer`),
  }));
}
