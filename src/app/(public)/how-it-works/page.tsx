import {
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  Layers,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

export const metadata = {
  title: "How It Works — BikriPilot",
  description:
    "See how BikriPilot simplifies your social commerce workflow in 4 simple steps: connect your page, reply with AI, book couriers, and balance your ledger.",
};

export default async function HowItWorksPage() {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("landing")]);
  const isBn = locale === "bn";

  const steps = [
    {
      num: "01",
      key: "connect",
      badge: isBn ? "ধাপ ১" : "Step 1",
      details: isBn
        ? [
            "অফিসিয়াল মেটা গ্রাফ API অথরাইজেশন",
            "কোনো পাসওয়ার্ড শেয়ারিং ছাড়াই নিরাপদ OAuth হ্যান্ডশেক",
            "সার্ভারে AES-256-GCM এনক্রিপশনের মাধ্যমে টোকেন সংরক্ষিত",
          ]
        : [
            "Official Meta Graph API authorization",
            "Zero password sharing — secure OAuth handshake",
            "Tokens encrypted on server using AES-256-GCM",
          ],
    },
    {
      num: "02",
      key: "catalogue",
      badge: isBn ? "ধাপ ২" : "Step 2",
      details: isBn
        ? [
            "পণ্যের নাম, ভ্যারিয়েশন ও মূল্য একবার সেট করলেই প্রস্তুত",
            "Steadfast, Pathao বা RedX API ক্রেডেনশিয়াল সংযোগ",
            "মাত্র ৫ মিনিটেরও কম সময়ে সেটআপ সম্পন্ন",
          ]
        : [
            "Store product names, SKU variations, and pricing once",
            "Connect Steadfast, Pathao, or RedX API credentials",
            "Ready in less than 5 minutes",
          ],
    },
    {
      num: "03",
      key: "reply",
      badge: isBn ? "ধাপ ৩" : "Step 3",
      details: isBn
        ? [
            "বাংলা ও বাংলিশে AI বুদ্ধিমান ড্রাফট রিপ্লাই তৈরি করে",
            "চ্যাট থেকেই এক ক্লিকে কাস্টমারের অর্ডার এক্সট্র্যাক্ট",
            "ফেক অর্ডার ও রিটার্নকারী ক্রেতা আগে থেকেই শনাক্ত",
          ]
        : [
            "AI generates intelligent reply suggestions in Bangla & Banglish",
            "One-click customer order extraction right in the conversation",
            "Instant delivery risk check against fake or high-return buyers",
          ],
    },
    {
      num: "04",
      key: "deliver",
      badge: isBn ? "ধাপ ৪" : "Step 4",
      details: isBn
        ? [
            "এক ট্যাপেই সরাসরি আপনার কুরিয়ার অ্যাকাউন্টে পার্সেল বুকিং",
            "স্বয়ংক্রিয় ট্র্যাকিং লিংক ও কাস্টমার ডেলিভারি আপডেট",
            "কুরিয়ারের COD টাকা সরাসরি হিসাব খাতায় জমা",
          ]
        : [
            "One-tap consignment dispatch to your courier account",
            "Automated customer tracking link and delivery updates",
            "Courier COD payouts automatically reconciled into Hisab Khata",
          ],
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-primary-soft px-3.5 py-1 text-sm font-semibold text-primary">
          <Layers className="size-4" />
          <span>{t("howEyebrow")}</span>
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          {t("howTitle")}
        </h1>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">
          {t("howHeroDesc")}
        </p>
      </div>

      {/* 4 Steps Detailed Grid */}
      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((item) => (
          <div
            key={item.key}
            className="relative flex flex-col justify-between rounded-2xl border bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold text-primary">
                  {item.num}
                </span>
                <span className="rounded-full border bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                  {item.badge}
                </span>
              </div>
              <h2 className="mt-4 text-xl font-bold">
                {t(`steps.${item.key}.title`)}
              </h2>
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

      {/* Live Workflow Simulation Preview */}
      <section className="mt-20 overflow-hidden rounded-3xl border bg-muted/40 text-foreground">
        <div className="mx-auto grid max-w-6xl gap-10 p-8 sm:p-14 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              <Zap className="size-3.5" />
              <span>{t("workflowEyebrow")}</span>
            </div>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl text-foreground">
              {t("workflowTitle")}
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              {t("workflowBody")}
            </p>
            <div className="mt-8 flex flex-col gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="size-4 text-success" />
                <span>
                  {isBn
                    ? "ফোন নম্বর ও ঠিকানা ম্যানুয়ালি কপি-পেস্ট করার ঝামেলা নেই"
                    : "Zero manual copy-pasting of customer phone numbers & addresses"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="size-4 text-success" />
                <span>
                  {isBn
                    ? "পার্সেল বুক করার আগেই কাস্টমারের ডেলিভারি রিস্ক রেটিং দেখা যায়"
                    : "Automatic delivery risk rating displayed before parcel booking"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="size-4 text-success" />
                <span>
                  {isBn
                    ? "কুরিয়ার পোর্টালের সাথে রিয়েল-টাইম তথ্য সিঙ্ক"
                    : "Real-time sync with courier dispatch portals"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 text-sm font-sans">
            <div className="rounded-2xl border bg-card p-4 shadow-xs text-foreground">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {isBn ? "কাস্টমার মেসেজ" : "Customer Message"}
              </p>
              <p className="mt-1 font-medium">{t("workflowMessage")}</p>
            </div>
            <div className="ml-6 rounded-2xl border border-primary/30 bg-primary-soft p-4 shadow-xs sm:ml-10 text-foreground">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary">
                  {isBn ? "AI অ্যাসিস্ট্যান্ট ড্রাফট" : "AI Assistant Draft"}
                </span>
                <Bot className="size-3.5 text-primary" />
              </div>
              <p className="mt-1 font-medium">{t("workflowReply")}</p>
            </div>
            <div className="mr-6 rounded-2xl border border-success/30 bg-success-soft p-4 shadow-xs sm:mr-10 text-foreground">
              <div className="flex items-center justify-between font-semibold">
                <span>{t("workflowOrder")}</span>
                <Check className="size-4 text-success" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("workflowBooked")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison: Without vs With */}
      <section className="mt-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            {isBn
              ? "সোশ্যাল বিক্রেতারা কেন বিক্রিপাইলট বেছে নিচ্ছেন"
              : "Why social sellers switch to BikriPilot"}
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            {isBn
              ? "ম্যানুয়াল হিসাব ও মেসেজ সামলানোর ঝক্কির সাথে বিক্রিপাইলটের অটোমেশনের তুলনা করুন।"
              : "Compare the traditional manual chaos with BikriPilot's automated operating system."}
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {/* Without Bikrio */}
          <div className="rounded-2xl border border-danger/30 bg-card p-6 shadow-xs sm:p-8">
            <div className="inline-flex rounded-full bg-danger-soft px-3 py-1 text-xs font-semibold text-danger">
              {t("comparison.without.title")}
            </div>
            <ul className="mt-6 space-y-4 text-sm text-muted-foreground">
              {[1, 2, 3, 4, 5].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-danger/10 text-xs font-bold text-danger">
                    ✕
                  </span>
                  <span>{t(`comparison.without.item${item}`)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* With Bikrio */}
          <div className="rounded-2xl border border-primary/40 bg-card p-6 shadow-sm sm:p-8">
            <div className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              {t("comparison.with.title")}
            </div>
            <ul className="mt-6 space-y-4 text-sm text-muted-foreground">
              {[1, 2, 3, 4, 5].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="mt-0.5 size-5 shrink-0 rounded-full bg-primary/10 p-1 text-primary" />
                  <span className="font-medium text-foreground">
                    {t(`comparison.with.item${item}`)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="mt-20 rounded-3xl border bg-primary p-8 text-primary-foreground sm:p-12">
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
              href="/features"
              className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-primary-foreground/30 px-6 font-semibold text-primary-foreground hover:bg-primary-foreground/10"
            >
              {t("navFeatures")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
