import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Layers,
  MessageCircle,
  MessageSquareText,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  WalletCards,
  UsersRound,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { publicServerApi } from "@/lib/api/public.api";
import type { SiteContent } from "@/types/content";
import type { PublicPlan } from "@/types/plan";
import { formatMoney } from "@/lib/money";
import { PricingComparison } from "./PricingComparison";
import { DemoVideo } from "./DemoVideo";
import { PARTNERS } from "./IntegrationLogos";

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
  const featureCards = [
    {
      key: "inbox",
      icon: Bot,
      color: "text-primary bg-primary/10 border-primary/20",
      badge: "AI Powered",
      points: [
        "Replies to every customer message 24/7 — no human needs to stay online",
        "AI takes orders automatically from conversations, zero manual entry",
        "Instant draft suggestions in Bangla, English & Banglish",
        "Unified inbox for Facebook Messenger & comments",
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
                <DemoVideo url={config.heroVideoUrl} label={t("watchDemo")} />
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
      <section className="border-y bg-card/60 backdrop-blur-xs">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 py-3 text-xs sm:px-8">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="size-3 text-primary" />
            <span>{t("worksWith")}</span>
          </div>
          <div className="hidden h-3.5 w-px bg-border sm:block" />
          <div className="flex flex-wrap items-center justify-center gap-2">
            {PARTNERS.map((partner) => {
              const PartnerIcon = partner.Icon;
              return (
                <a
                  key={partner.id}
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Visit ${partner.name}`}
                  className="group inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-2.5 py-1 text-[11px] font-medium text-foreground transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-card hover:shadow-2xs"
                >
                  <PartnerIcon className="size-3.5 shrink-0 transition-transform duration-150 group-hover:scale-110" />
                  <span className="font-semibold">{partner.name}</span>
                </a>
              );
            })}
          </div>
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
      <section id="features" className="border-t">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-primary-soft px-3.5 py-1 text-sm font-semibold text-primary">
              <Sparkles className="size-4" />
              <span>{t("featureEyebrow")}</span>
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {t("featureTitle")}
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              {t("featuresHeroDesc")}
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                    <h3 className="mt-5 text-lg font-bold">
                      {t(`features.${item.key}.title`)}
                    </h3>
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
          <div className="mt-10 rounded-2xl border bg-card/60 p-5 sm:p-7 text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border bg-muted/80 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              <Layers className="size-3" />
              <span>Official Integrations</span>
            </div>
            <h3 className="mt-2 text-lg font-bold sm:text-xl">{t("worksWith")}</h3>
            <p className="mx-auto mt-1 max-w-xl text-xs text-muted-foreground">
              Direct API integrations, webhook automations &amp; courier partnerships
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
              {PARTNERS.map((partner) => {
                const PartnerIcon = partner.Icon;
                return (
                  <a
                    key={partner.id}
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Visit ${partner.name}`}
                    className="group inline-flex items-center gap-2 rounded-xl border border-border/80 bg-background/70 px-3 py-1.5 text-xs font-medium text-foreground transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-card hover:shadow-xs"
                  >
                    <PartnerIcon className="size-4 shrink-0 transition-transform duration-150 group-hover:scale-110" />
                    <span className="font-semibold">{partner.name}</span>
                    <span className="rounded bg-muted/80 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {partner.badge}
                    </span>
                    <ExternalLink className="size-3 text-muted-foreground/60 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-primary" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      <section
        id="how-it-works"
        className="mx-auto max-w-7xl px-5 py-20 sm:px-8"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Four Simple Steps
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            {t("howHeroDesc")}
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {([
            {
              num: "01", key: "connect", badge: "Step 1",
              badgeColor: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
              details: [
                "Official Meta Graph API authorization",
                "Zero password sharing — secure OAuth handshake",
                "Tokens encrypted on server using AES-256-GCM",
              ],
            },
            {
              num: "02", key: "catalogue", badge: "Step 2",
              badgeColor: "bg-violet-500/15 text-violet-400 border-violet-500/30",
              details: [
                "Store product names, SKU variations, and pricing once",
                "Connect Steadfast, Pathao, or RedX API credentials",
                "Ready in less than 5 minutes",
              ],
            },
            {
              num: "03", key: "reply", badge: "Step 3",
              badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
              details: [
                "AI generates intelligent reply suggestions in Bangla & Banglish",
                "One-click customer order extraction right in the conversation",
                "Instant delivery risk check against fake or high-return buyers",
              ],
            },
            {
              num: "04", key: "deliver", badge: "Step 4",
              badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
              details: [
                "One-tap consignment dispatch to your courier account",
                "Automated customer tracking link and delivery updates",
                "Courier COD payouts automatically reconciled into Hisab Khata",
              ],
            },
          ] as const).map((item) => (
            <div
              key={item.key}
              className="relative flex flex-col justify-between rounded-2xl border bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-extrabold text-primary">
                    {item.num}
                  </span>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold">
                  {t(`steps.${item.key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {t(`steps.${item.key}.body`)}
                </p>
              </div>
              <ul className="mt-6 space-y-2 border-t pt-4 text-xs leading-5 text-muted-foreground">
                {item.details.map((detail) => (
                  <li key={detail} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Live Workflow Simulation */}
        <div className="mt-16 overflow-hidden rounded-3xl border bg-muted/40 text-foreground">
          <div className="mx-auto grid max-w-6xl gap-10 p-8 sm:p-14 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                <Zap className="size-3.5" />
                <span>{t("workflowEyebrow")}</span>
              </div>
              <h3 className="mt-4 text-2xl font-bold sm:text-3xl text-foreground">
                {t("workflowTitle")}
              </h3>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                {t("workflowBody")}
              </p>
              <div className="mt-8 flex flex-col gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="size-4 text-success" />
                  <span>Zero manual copy-pasting of customer phone numbers &amp; addresses</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="size-4 text-success" />
                  <span>Automatic delivery risk rating displayed before parcel booking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="size-4 text-success" />
                  <span>Real-time sync with courier dispatch portals</span>
                </div>
              </div>
            </div>
            {/* Inbox container */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-md">
              {/* Inbox header */}
              <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="grid size-7 place-items-center rounded-full bg-primary/10 text-primary">
                    <MessageCircle className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">BikriPilot Inbox</p>
                    <p className="text-[10px] text-muted-foreground">Messenger · Facebook Page</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-success animate-pulse" />
                  <span className="text-[10px] font-semibold text-success">Online</span>
                </div>
              </div>
              {/* Messages area */}
              <div className="flex flex-col gap-3 p-4 text-sm">
                {/* Customer message — right aligned */}
                <div className="flex flex-col items-end">
                  <span className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Customer</span>
                  <div className="max-w-[82%] rounded-2xl rounded-tr-sm bg-muted px-4 py-2.5 text-foreground shadow-xs">
                    <p className="font-medium leading-relaxed">{t("workflowMessage")}</p>
                  </div>
                </div>
                {/* AI reply — left aligned */}
                <div className="flex flex-col items-start">
                  <div className="mb-1 flex items-center gap-1.5">
                    <Sparkles className="size-3 text-primary" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">AI Assistant</span>
                  </div>
                  <div className="max-w-[82%] rounded-2xl rounded-tl-sm border border-primary/25 bg-primary-soft px-4 py-2.5 text-foreground shadow-xs">
                    <p className="font-medium leading-relaxed">{t("workflowReply")}</p>
                  </div>
                </div>
                {/* Order ready status card */}
                <div className="rounded-xl border border-success/30 bg-success-soft px-4 py-2.5">
                  <div className="flex items-center justify-between font-semibold text-foreground">
                    <span>{t("workflowOrder")}</span>
                    <Check className="size-4 text-success" />
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{t("workflowBooked")}</p>
                </div>
              </div>
              {/* Fake input bar */}
              <div className="flex items-center gap-2 border-t bg-muted/30 px-4 py-2.5">
                <div className="h-8 flex-1 rounded-full border bg-background px-3 text-[11px] text-muted-foreground flex items-center">
                  Type a reply or let AI draft one…
                </div>
                <div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                  <ArrowRight className="size-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="rounded-2xl border border-primary bg-card p-7 shadow-xs">
            <p className="text-sm font-semibold text-primary">
              {t("ledgerEyebrow")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold">{t("ledgerTitle")}</h2>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-primary/20 bg-primary-soft p-4">
                <p className="text-xs font-medium text-foreground/80 sm:text-sm">
                  {t("youGet")}
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  ৳24,500
                </p>
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary-soft p-4">
                <p className="text-xs font-medium text-foreground/80 sm:text-sm">
                  {t("youGive")}
                </p>
                <p className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">
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
            <div className="rounded-2xl border border-danger/30 bg-card p-6 shadow-xs">
              <div className="inline-flex rounded-full bg-danger-soft px-3 py-1 text-xs font-semibold text-danger">
                {t("comparison.without.title")}
              </div>
              <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-danger/10 text-xs font-bold text-danger">✕</span>
                  <span className="font-medium text-foreground/80">Must keep someone online 24/7 to manually reply messages &amp; take orders</span>
                </li>
                {[1, 2, 3, 4, 5].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-danger/10 text-xs font-bold text-danger">✕</span>
                    <span>{t(`comparison.without.item${item}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-primary/40 bg-card p-6 shadow-sm">
              <div className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                {t("comparison.with.title")}
              </div>
              <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 size-5 shrink-0 rounded-full bg-primary/10 p-1 text-primary" />
                  <span className="font-medium text-foreground">AI replies &amp; takes orders 24/7 automatically — no one needs to be online</span>
                </li>
                {[1, 2, 3, 4, 5].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="mt-0.5 size-5 shrink-0 rounded-full bg-primary/10 p-1 text-primary" />
                    <span className="font-medium text-foreground">{t(`comparison.with.item${item}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
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
        <PricingComparison plans={plans} compact />
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
