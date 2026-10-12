import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  ClipboardList,
  Layers,
  MessageSquareText,
  PackageCheck,
  ShieldCheck,
  UsersRound,
  WalletCards,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export const metadata = {
  title: "Features — BikriPilot",
  description:
    "Explore the AI-powered commerce operating system for social sellers, Messenger automation, courier booking, and Hisab Khata.",
};

export default async function FeaturesPage() {
  const t = await getTranslations("landing");

  const featureCards = [
    {
      key: "inbox",
      icon: Bot,
      color: "text-primary bg-primary/10 border-primary/20",
      badge: "AI Powered",
      points: [
        "Instant draft suggestions in Bangla, English & Banglish",
        "Unified inbox for Facebook Messenger & comments",
        "24/7 automated inquiry handling & instant customer replies",
      ],
    },
    {
      key: "orders",
      icon: ClipboardList,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      badge: "One-Click",
      points: [
        "Extract customer name, phone, address and item directly from chat",
        "Auto-generate complete order drafts in seconds",
        "Prevents order loss and saves hours of manual data entry",
      ],
    },
    {
      key: "courier",
      icon: PackageCheck,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      badge: "Multi-Courier",
      points: [
        "Native integrations with Steadfast, Pathao, and RedX",
        "Book parcels with a single tap without opening courier panels",
        "Automated consignment tracking and status sync",
      ],
    },
    {
      key: "risk",
      icon: ShieldCheck,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      badge: "Fraud Shield",
      points: [
        "Network-wide delivery success score for customer phone numbers",
        "Instant warnings on chronic order cancelers & fake orders",
        "Significantly lowers returned shipment (RTO) costs",
      ],
    },
    {
      key: "ledger",
      icon: WalletCards,
      color: "text-teal-500 bg-teal-500/10 border-teal-500/20",
      badge: "Hisab Khata",
      points: [
        "Automated cash-flow records tied to orders and courier payouts",
        "Real-time tracking of 'You Will Get' and 'You Will Give' dues",
        "One-click customer due reminders via SMS",
      ],
    },
    {
      key: "comments",
      icon: MessageSquareText,
      color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
      badge: "Social Sales",
      points: [
        "Automatically reply to product inquiries on Facebook posts",
        "Auto-route public comments directly to private Messenger inbox",
        "Boost customer engagement and sales conversions",
      ],
    },
    {
      key: "automation",
      icon: Zap,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      badge: "Smart Rules",
      points: [
        "Preset quick replies and FAQ automated responses",
        "Keyword-based triggers for pricing, sizes, and stock availability",
        "Zero setup complexity, active 24/7",
      ],
    },
    {
      key: "team",
      icon: UsersRound,
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
      badge: "Collaboration",
      points: [
        "Role-based access controls for Owners, Managers, and Agents",
        "Keep sensitive business metrics and credentials protected",
        "Track individual teammate performance and response times",
      ],
    },
    {
      key: "reports",
      icon: BarChart3,
      color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
      badge: "Analytics",
      points: [
        "Real-time dashboards for daily revenue, sales volume, and COD payouts",
        "Courier delivery success rates and return analytics",
        "Export clean CSV reports anytime for accounting",
      ],
    },
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-primary-soft px-3.5 py-1 text-sm font-semibold text-primary">
          <Layers className="size-4" />
          <span>{t("featureEyebrow")}</span>
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          {t("featureTitle")}
        </h1>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">
          {t("featuresHeroDesc")}
        </p>
      </div>

      {/* Feature Grid */}
      <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {featureCards.map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.key}
              id={item.key}
              className="group relative flex flex-col justify-between rounded-2xl border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div
                    className={`grid size-12 place-items-center rounded-xl border ${item.color}`}
                  >
                    <Icon className="size-6" />
                  </div>
                  <span className="rounded-full border bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                    {item.badge}
                  </span>
                </div>
                <h2 className="mt-5 text-xl font-bold">
                  {t(`features.${item.key}.title`)}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {t(`features.${item.key}.body`)}
                </p>
                <ul className="mt-5 space-y-2.5 border-t pt-5 text-xs leading-5 text-muted-foreground">
                  {item.points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          );
        })}
      </div>

      {/* Integrations Banner */}
      <section className="mt-20 rounded-2xl border bg-muted/40 p-8 sm:p-12">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
            <Layers className="size-3.5" />
            <span>Official Integrations</span>
          </div>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
            {t("worksWith")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Seamlessly connected with your essential commerce, delivery, and payment channels.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 font-semibold text-sm">
            {[
              "Meta Messenger",
              "Facebook Pages",
              "Steadfast Courier",
              "Pathao Courier",
              "RedX Courier",
              "bKash",
              "Nagad",
              "SSLCommerz",
            ].map((partner) => (
              <span
                key={partner}
                className="rounded-xl border bg-card px-4 py-2 shadow-xs"
              >
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="mt-16 rounded-3xl border bg-primary p-8 text-primary-foreground sm:p-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <div>
            <h2 className="text-3xl font-bold">{t("finalTitle")}</h2>
            <p className="mt-2 text-primary-foreground/80 max-w-xl">
              {t("finalBody")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/register"
              className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-card px-6 font-semibold text-foreground shadow-sm transition-transform hover:scale-105"
            >
              {t("startFree")}
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-primary-foreground/30 px-6 font-semibold text-primary-foreground hover:bg-primary-foreground/10"
            >
              {t("navPricing")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
