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
  ExternalLink,
  WalletCards,
  UsersRound,
  Workflow,
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
import { PARTNERS, MessengerLogo, WhatsAppLogo } from "./IntegrationLogos";
import { InteractiveShowcase } from "./InteractiveShowcase";

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
      ],
    },
    {
      key: "team",
      icon: UsersRound,
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
      badge: "Collaboration",
      points: [
        "Role-based access controls for Owners, Managers, and Agents",
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
      ],
    },
  ] as const;

  const withoutBikriPilot = [
    localized(
      locale,
      "কাউকে ২৪/৭ অনলাইনে থেকে ম্যানুয়ালি মেসেজ ও অর্ডার নিতে হয়",
      "Must keep someone online 24/7 to manually reply & take orders"
    ),
    localized(
      locale,
      "রাতে মেসেজ জমে থাকে ও কাস্টমারের গুরুত্বপূর্ণ অর্ডার মিস হয়",
      "Messages pile up at night, important customer orders get missed"
    ),
    localized(
      locale,
      "একই প্রশ্ন বারবার আসে, প্রতিবার ম্যানুয়ালি রিপ্লাই দিতে হয়",
      "The same questions repeat, manually replying every time"
    ),
    localized(
      locale,
      "ফেক অর্ডার ও রিটার্নের কারণে কুরিয়ার চার্জের আর্থিক ক্ষতি",
      "Fake orders and returns, zero pre-dispatch verification"
    ),
    localized(
      locale,
      "চ্যাট থেকে কাস্টমারের ঠিকানা কুরিয়ার প্যানেলে কপি-পেস্ট করতে হয়",
      "Customer details copied from chat into courier panels"
    ),
    localized(
      locale,
      "টিম মেম্বারদের কাজ, রেসপন্স টাইম ও পারফরম্যান্স ট্র্যাকিং কঠিন",
      "Teammate work and response times are hard to follow"
    ),
  ];

  const withBikriPilot = [
    localized(
      locale,
      "AI উত্তর ও অর্ডার নেয় ২৪/৭ — কাউকে জেগে অনলাইনে থাকতে হয় না",
      "AI replies & takes orders 24/7 automatically — zero human fatigue"
    ),
    localized(
      locale,
      "রাতে কোনো মেসেজ মিস হয় না — সাথে সাথে স্বয়ংক্রিয় রিপ্লাই হয়ে যায়",
      "Zero missed night messages — instant replies keep buyers engaged"
    ),
    localized(
      locale,
      "স্মার্ট FAQ ও অটো-রিপ্লাই — বারবার টাইপ না করে এক সেকেন্ডেই উত্তর",
      "Instant automated replies for price, size & product inquiries"
    ),
    localized(
      locale,
      "শিপ করার আগেই ফ্রড প্রতিরোধ — ডেলিভারি রেট দেখে রিটার্ন কমান",
      "Pre-dispatch Fraud Shield alerts on chronic cancelers before shipping"
    ),
    localized(
      locale,
      "এক ট্যাপে কুরিয়ার বুকিং — চ্যাট থেকেই এক ক্লিকে পার্সেল এন্ট্রি",
      "One-tap direct courier dispatch to Steadfast, Pathao & RedX"
    ),
    localized(
      locale,
      "স্বচ্ছ রোল-বেসড টিম কন্ট্রোল ও প্রতিটি মেম্বারের রেসপন্স ট্র্যাকিং",
      "Transparent team collaboration with role-based permissions"
    ),
  ];

  return (
    <main className="overflow-hidden">
      <section className="relative border-b bg-[radial-gradient(circle_at_75%_20%,var(--primary-soft),transparent_38%),linear-gradient(135deg,var(--background),var(--muted))]">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
          <div className="relative z-10">
            {config?.freeLaunchMode ? (
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-card/80 px-3.5 py-1.5 text-sm font-semibold text-primary shadow-2xs">
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
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-1">
                    <MessengerLogo className="size-6 rounded-full border border-background shadow-xs" />
                    <WhatsAppLogo className="size-6 rounded-full border border-background shadow-xs" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-sm text-foreground">FB Page &amp; WhatsApp Inbox</p>
                      <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[9px] font-bold text-blue-600">Meta API</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Connected to your Facebook Page 24/7
                    </p>
                  </div>
                </div>
                <div className="grid size-9 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
                  <Bot className="size-4.5" />
                </div>
              </div>
              <div className="space-y-3 py-5 text-sm">
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-muted p-3">
                  <div className="mb-1 flex items-center justify-end gap-1 text-[10px] font-semibold text-blue-600">
                    <MessengerLogo className="size-3" />
                    <span>Customer on FB Page</span>
                  </div>
                  {t("mockQuestion")}
                </div>
                <div className="max-w-[88%] rounded-2xl rounded-bl-sm bg-primary-soft p-3 text-foreground">
                  <span className="mb-1 flex items-center gap-1.5 text-xs font-bold text-primary">
                    <Bot className="size-3.5" />
                    BikriPilot AI (Page Auto-Reply)
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
            <Layers className="size-3.5 text-primary" />
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

      {/* Interactive Platform Cockpit Showcase */}
      <InteractiveShowcase />

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
                  <div className="flex -space-x-1">
                    <MessengerLogo className="size-6 rounded-full border border-background shadow-xs" />
                    <WhatsAppLogo className="size-6 rounded-full border border-background shadow-xs" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-foreground">FB Page &amp; WhatsApp Live Inbox</p>
                      <span className="rounded-full bg-blue-500/10 px-1.5 py-0.2 text-[9px] font-bold text-blue-600">Meta Webhook</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Automated customer replies for your Page</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-success animate-pulse" />
                  <span className="text-[10px] font-semibold text-success">24/7 Online</span>
                </div>
              </div>
              {/* Messages area */}
              <div className="flex flex-col gap-3 p-4 text-sm">
                {/* Customer message — right aligned */}
                <div className="flex flex-col items-end">
                  <span className="mb-1 flex items-center gap-1 text-[10px] font-semibold text-blue-600">
                    <MessengerLogo className="size-3" />
                    <span>Customer on Facebook Page</span>
                  </span>
                  <div className="max-w-[82%] rounded-2xl rounded-tr-sm bg-muted px-4 py-2.5 text-foreground shadow-xs">
                    <p className="font-medium leading-relaxed">{t("workflowMessage")}</p>
                  </div>
                </div>
                {/* AI reply — left aligned */}
                <div className="flex flex-col items-start">
                  <div className="mb-1 flex items-center gap-1.5">
                    <Bot className="size-3.5 text-primary" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">BikriPilot AI (Page Auto-Reply)</span>
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
            <div className="rounded-2xl border border-danger/30 bg-card p-5 sm:p-6 shadow-xs">
              <div className="inline-flex rounded-full bg-danger-soft px-3 py-1 text-xs font-semibold text-danger">
                {t("comparison.without.title")}
              </div>
              <ul className="mt-5 space-y-3 text-xs sm:text-sm text-muted-foreground">
                {withoutBikriPilot.map((text, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-danger/10 text-[11px] font-bold text-danger">
                      ✕
                    </span>
                    <span className="font-medium text-foreground/85 leading-snug">
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-primary/40 bg-card p-5 sm:p-6 shadow-sm">
              <div className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                {t("comparison.with.title")}
              </div>
              <ul className="mt-5 space-y-3 text-xs sm:text-sm text-muted-foreground">
                {withBikriPilot.map((text, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-5 shrink-0 rounded-full bg-primary/10 p-1 text-primary" />
                    <span className="font-medium text-foreground leading-snug">
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Official Integrations Card */}
        <div className="mt-14 sm:mt-16 rounded-2xl border bg-card/60 p-5 sm:p-7 text-center">
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
      </section>

      <section id="features" className="border-t">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:py-20 sm:px-8">
          {/* Section Header: Left Square Badge & Right Title/Description */}
          <div className="flex flex-col sm:flex-row sm:items-stretch gap-4 sm:gap-6">
            {/* Left Square Card - Full height matching right content */}
            <div className="shrink-0 flex sm:flex-col items-center justify-center gap-3 sm:gap-2.5 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/15 via-violet-500/10 to-primary/5 px-4 py-3 sm:p-4 sm:w-28 shadow-xs">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/25">
                <Workflow className="size-5" />
              </div>
              <span className="text-xs sm:text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 text-center">
                {t("featureEyebrow")}
              </span>
            </div>

            {/* Right: Title and Description */}
            <div className="flex flex-col justify-center max-w-3xl">
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl text-foreground">
                Keep the path from chat to cash clear.
              </h2>
              <p className="mt-2 text-sm sm:text-base leading-relaxed text-muted-foreground">
                An integrated operating system designed for modern social commerce sellers and growing retail brands.
              </p>
            </div>
          </div>

          {/* Compact 9 Feature Cards Grid */}
          <div className="mt-8 sm:mt-12 grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.key}
                  id={item.key}
                  className="group relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`grid size-9 shrink-0 place-items-center rounded-lg border ${item.color}`}
                        >
                          <Icon className="size-4.5" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">
                          {t(`features.${item.key}.title`)}
                        </h3>
                      </div>
                      <span className="shrink-0 rounded-md border border-border/70 bg-muted/50 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        {item.badge}
                      </span>
                    </div>

                    <ul className="mt-3.5 space-y-1.5 border-t border-border/50 pt-3 text-xs leading-relaxed text-muted-foreground">
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
