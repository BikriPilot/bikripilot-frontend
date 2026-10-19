"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import {
  Bot,
  Check,
  CheckCircle2,
  Search,
  Lock,
  ClipboardList,
  UserCheck,
  Play,
  Pause,
  XCircle,
  FileCheck,
  Mail,
  BellRing,
} from "lucide-react";
import {
  MessengerLogo,
  FacebookLogo,
  WhatsAppLogo,
  SteadfastLogo,
  PathaoLogo,
  RedXLogo,
} from "./IntegrationLogos";

interface TabItem {
  id: string;
  slug: string;
  title: string;
  titleBn: string;
}

const TABS: TabItem[] = [
  {
    id: "auto-reply",
    slug: "ai-auto-reply",
    title: "AI Auto Reply",
    titleBn: "AI অটো-রিপ্লাই",
  },
  {
    id: "chat-to-order",
    slug: "chat-to-order",
    title: "Chat to Order",
    titleBn: "চ্যাট থেকে অর্ডার",
  },
  {
    id: "manual-approved",
    slug: "manual-approved",
    title: "Manual Approved",
    titleBn: "ম্যানুয়াল অনুমোদন",
  },
  {
    id: "fraud-risk",
    slug: "fraud-risk-radar",
    title: "Fraud & Risk Radar",
    titleBn: "ফ্রড ও রিস্ক রাডার",
  },
  {
    id: "courier-dispatch",
    slug: "courier-dispatch",
    title: "Courier Dispatch",
    titleBn: "কুরিয়ার বুকিং",
  },
  {
    id: "hisab-khata",
    slug: "hisab-khata",
    title: "Hisab Khata",
    titleBn: "হিসাব খাতা",
  },
  {
    id: "sms-email",
    slug: "sms-and-email",
    title: "SMS & Email",
    titleBn: "SMS ও ইমেইল",
  },
];

export function InteractiveShowcase() {
  const locale = useLocale();
  const isBn = locale === "bn";
  const [activeTab, setActiveTab] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active tab into center on mobile/tablet without moving page scroll
  useEffect(() => {
    const el = tabRefs.current[activeTab];
    if (el && tabsContainerRef.current) {
      const container = tabsContainerRef.current;
      const elLeft = el.offsetLeft;
      const elWidth = el.offsetWidth;
      const containerWidth = container.offsetWidth;
      const targetScroll = elLeft - (containerWidth / 2) + (elWidth / 2);
      container.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: "smooth",
      });
    }
  }, [activeTab]);

  // Strictly sequential auto-cycle through tabs (0 -> 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 0)
  useEffect(() => {
    if (isPaused) return;

    const rafId = requestAnimationFrame(() => setProgress(0));
    const startTime = Date.now();
    const duration = 5000; // 5.0 seconds per tab

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(timer);
        setActiveTab((prev) => (prev + 1) % TABS.length);
        setProgress(0);
      }
    }, 40);

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(timer);
    };
  }, [activeTab, isPaused]);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    setProgress(0);
  };

  const currentTab = TABS[activeTab];

  return (
    <section id="interactive-showcase" className="relative overflow-hidden border-b bg-gradient-to-b from-background via-muted/20 to-background py-12 sm:py-20">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-40">
        <div className="size-[550px] rounded-full bg-primary/10 blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            {isBn ? (
              <>
                আপনার ফেসবুক ও হোয়াটসঅ্যাপ বিজনেসের যা কিছু প্রয়োজন,{" "}
                <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                  এক প্ল্যাটফর্মেই।
                </span>
              </>
            ) : (
              <>
                Everything your Facebook, WhatsApp Business shop needs,{" "}
                <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                  in one cockpit.
                </span>
              </>
            )}
          </h2>
          <p className="mt-2 text-xs text-muted-foreground sm:mt-3 sm:text-base">
            {isBn
              ? "২৪/৭ AI চ্যাট রিপ্লাই থেকে শুরু করে অর্ডার কনফার্মেশন, কুরিয়ার বুকিং ও হিসাব খাতা।"
              : "From 24/7 AI conversation replies to manual order approval, courier booking."}
          </p>
        </div>

        {/* Clean Text-Only Tabs Bar - Touch swipeable on mobile & tablet */}
        <div className="mt-8 sm:mt-10">
          <div
            ref={tabsContainerRef}
            className="overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth touch-pan-x"
          >
            <div className="flex min-w-max border-b border-border/80 dark:border-white/10">
              {TABS.map((tab, idx) => {
                const isActive = activeTab === idx;
                const hue1 = (215 + progress * 1.6) % 360;
                const hue2 = (275 + progress * 1.6) % 360;
                const hue3 = (340 + progress * 1.6) % 360;

                return (
                  <button
                    key={tab.id}
                    ref={(el) => {
                      tabRefs.current[idx] = el;
                    }}
                    onClick={() => handleTabClick(idx)}
                    className={`group relative flex-1 shrink-0 whitespace-nowrap rounded-none px-3.5 py-3 sm:px-4 sm:py-3.5 text-center text-xs font-semibold sm:text-sm border-t-2 border-r first:border-l transition-[background-color,border-color,color,box-shadow] duration-200 ${
                      isActive
                        ? "bg-card border-t-primary border-r-border/80 dark:border-r-border first:border-l-border/80 dark:first:border-l-border font-bold shadow-xs text-foreground z-10"
                        : "border-t-border/40 dark:border-t-white/10 border-r-border/50 dark:border-r-white/10 first:border-l-border/50 dark:first:border-l-white/10 bg-muted/20 dark:bg-slate-950/80 text-muted-foreground dark:text-slate-400 hover:text-foreground hover:bg-muted/40 dark:hover:bg-slate-900/90 dark:hover:text-white font-medium"
                    }`}
                    style={
                      isActive
                        ? {
                            backgroundImage: `radial-gradient(130% 130% at 50% 100%, hsla(${hue2}, 85%, 55%, 0.16) 0%, hsla(${hue1}, 80%, 50%, 0.06) 60%, transparent 100%)`,
                            boxShadow: `0 -2px 14px -2px hsla(${hue2}, 90%, 60%, 0.12)`,
                          }
                        : undefined
                    }
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      <span className="relative inline-flex items-center">
                        <span
                          className={
                            isActive
                              ? "text-foreground font-bold transition-colors"
                              : "group-hover:text-foreground transition-colors"
                          }
                        >
                          {isBn ? tab.titleBn : tab.title}
                        </span>
                        {isActive && (
                          <span
                            className="absolute -top-1 -right-2.5 size-1.5 rounded-full animate-pulse"
                            style={{
                              backgroundColor: `hsl(${hue2}, 90%, 60%)`,
                              boxShadow: `0 0 8px hsl(${hue2}, 90%, 60%)`,
                            }}
                          />
                        )}
                      </span>
                    </span>

                    {/* Active tab underline with dynamic multi-color shifting progress fill */}
                    {isActive ? (
                      <div className="absolute inset-x-0 bottom-0 h-[3px] overflow-hidden bg-border/40">
                        <div
                          className="relative h-full transition-all duration-75 ease-linear"
                          style={{
                            width: `${progress}%`,
                            background: `linear-gradient(90deg, hsl(${hue1}, 92%, 56%), hsl(${hue2}, 88%, 60%), hsl(${hue3}, 95%, 62%))`,
                            boxShadow: `0 0 10px hsl(${hue2}, 90%, 60%, 0.6)`,
                          }}
                        >
                          {/* Glowing leading pip at the progress front */}
                          <div
                            className="absolute right-0 top-1/2 size-2 -mr-1 -translate-y-1/2 rounded-full bg-white"
                            style={{
                              boxShadow: `0 0 6px #ffffff, 0 0 12px hsl(${hue3}, 95%, 62%)`,
                            }}
                          />
                        </div>
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Auto-cycle pause/play control & Mobile Step Pill */}
        <div className="mt-3.5 flex items-center justify-between text-xs">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 dark:border-border bg-card px-3 py-1.5 font-medium text-foreground shadow-2xs transition-colors hover:bg-muted"
            title={isPaused ? (isBn ? "চালান" : "Resume auto-play") : (isBn ? "থামান" : "Pause auto-play")}
          >
            {isPaused ? <Play className="size-3 text-primary fill-primary" /> : <Pause className="size-3 text-muted-foreground" />}
            <span>{isPaused ? (isBn ? "চালান" : "Play") : (isBn ? "থামান" : "Pause")}</span>
          </button>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground sm:hidden">
            <span className="rounded-full border border-border/60 bg-muted/50 px-2 py-0.5 font-mono text-[10px] font-semibold text-foreground">
              {activeTab + 1} / {TABS.length}
            </span>
          </div>
        </div>

        {/* Browser Window Frame Container */}
        <div className="mt-3 overflow-hidden rounded-xl border border-border/80 dark:border-border bg-card shadow-xl sm:rounded-3xl">
          {/* Window Chrome Header */}
          <div className="flex items-center justify-between border-b border-border/80 dark:border-border bg-muted/40 px-3 py-2 sm:px-6 sm:py-2.5">
            {/* Mac Window Dots */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="size-2 sm:size-2.5 rounded-full bg-rose-500/80 shadow-2xs" />
              <span className="size-2 sm:size-2.5 rounded-full bg-amber-500/80 shadow-2xs" />
              <span className="size-2 sm:size-2.5 rounded-full bg-emerald-500/80 shadow-2xs" />
            </div>

            {/* Simulated Address Bar */}
            <div className="flex max-w-[170px] sm:max-w-sm flex-1 items-center justify-center gap-1.5 sm:gap-2 rounded-lg border border-border/60 dark:border-border bg-background px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-[11px] text-muted-foreground">
              <Lock className="size-2.5 sm:size-3 text-emerald-500 shrink-0" />
              <span className="truncate font-mono font-medium text-foreground/80">
                bikripilot.com/{currentTab.slug}
              </span>
            </div>

            {/* Status indicator */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-foreground">
                {isBn ? "২৪/৭ সক্রিয়" : "24/7 Active"}
              </span>
            </div>
          </div>

          {/* Window Content Body */}
          <div className="min-h-[440px] p-3 sm:p-5 lg:p-7">
            <div className="transition-all duration-300">
              {activeTab === 0 && <InboxPreview isBn={isBn} />}
              {activeTab === 1 && <OrderExtractionPreview isBn={isBn} />}
              {activeTab === 2 && <ManualApprovalPreview isBn={isBn} />}
              {activeTab === 3 && <RiskRadarPreview isBn={isBn} />}
              {activeTab === 4 && <CourierPreview isBn={isBn} />}
              {activeTab === 5 && <HisabKhataPreview isBn={isBn} />}
              {activeTab === 6 && <SmsEmailPreview isBn={isBn} />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   1. AI AUTO REPLY PREVIEW
   ========================================================================= */
function InboxPreview({ isBn }: { isBn: boolean }) {
  return (
    <div className="grid gap-4 lg:grid-cols-12">
      {/* Conversations Column (4 cols) */}
      <div className="rounded-2xl border border-border/70 dark:border-border bg-card p-4 lg:col-span-4 shadow-2xs">
        {/* Channel Filters */}
        <div className="flex items-center gap-1.5 pb-3 border-b border-border/60">
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 dark:border-blue-400/40 bg-blue-500/10 dark:bg-blue-500/25 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
            <MessengerLogo className="size-3" />
            <span>FB Page</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 dark:border-emerald-400/40 bg-emerald-500/10 dark:bg-emerald-500/25 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            <WhatsAppLogo className="size-3" />
            <span>WhatsApp</span>
          </span>
          <span className="ml-auto rounded-full bg-primary-soft dark:bg-primary-soft/30 px-1.5 py-0.2 text-[10px] font-bold text-primary dark:text-primary-light">
            {isBn ? "৩টি নতুন" : "3 New"}
          </span>
        </div>

        <div className="mt-3 space-y-2">
          {/* Active Conversation Item (Facebook Page Messenger) */}
          <div className="rounded-xl border border-primary/40 bg-primary-soft/40 p-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="grid size-7 place-items-center rounded-full bg-blue-500/20 dark:bg-blue-500/30 text-xs font-bold text-blue-600 dark:text-blue-400">
                    TA
                  </div>
                  <MessengerLogo className="absolute -bottom-1 -right-1 size-3.5 rounded-full border border-background shadow-xs" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Tanvir Ahmed</h4>
                  <div className="flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                    <span>{isBn ? "ফেসবুক পেজ ইনবক্স" : "Facebook Page Inbox"}</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-medium text-primary">
                {isBn ? "এইমাত্র" : "Just now"}
              </span>
            </div>
            <p className="mt-2 line-clamp-1 text-[11px] font-medium text-foreground">
              {isBn
                ? "ভাই, ব্ল্যাক কালারটা কি এভেইলেবল আছে? প্রাইস কত?"
                : "Bhai, black color ta ki available ase? Price koto?"}
            </p>
          </div>

          {/* Conversation 2 (WhatsApp Business) - Hidden on mobile for concise focus */}
          <div className="hidden md:block rounded-xl border border-border/50 bg-card p-2.5 transition-colors hover:border-primary/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="grid size-7 place-items-center rounded-full bg-emerald-500/20 dark:bg-emerald-500/30 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    SA
                  </div>
                  <WhatsAppLogo className="absolute -bottom-1 -right-1 size-3.5 rounded-full border border-background shadow-xs" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Sumaiya Akter</h4>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">WhatsApp Business</span>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground dark:text-zinc-400">
                {isBn ? "৪ মিনিট আগে" : "4m ago"}
              </span>
            </div>
            <p className="mt-2 line-clamp-1 text-[11px] text-muted-foreground dark:text-zinc-300">
              {isBn
                ? "আমার অর্ডার কনসাইনমেন্ট আইডি টা দিবেন প্লিজ।"
                : "Amar order consignment ID ta den please."}
            </p>
          </div>

          {/* Conversation 3 (Facebook Page Post Comment) - Hidden on mobile */}
          <div className="hidden md:block rounded-xl border border-border/50 bg-card p-2.5 transition-colors hover:border-primary/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="grid size-7 place-items-center rounded-full bg-indigo-500/20 dark:bg-indigo-500/30 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    RC
                  </div>
                  <FacebookLogo className="absolute -bottom-1 -right-1 size-3.5 rounded-full border border-background shadow-xs" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Rahat Chowdhury</h4>
                  <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                    {isBn ? "পেজ পোস্ট কমেন্ট" : "Page Post Comment"}
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground dark:text-zinc-400">
                {isBn ? "১২ মিনিট আগে" : "12m ago"}
              </span>
            </div>
            <p className="mt-2 line-clamp-1 text-[11px] font-medium text-foreground/90 dark:text-zinc-100">
              {isBn ? "ডেলিভারি চার্জসহ মোট দাম কত পড়বে?" : "What is the total price including delivery charge?"}
            </p>
          </div>
        </div>
      </div>

      {/* Active Chat & AI Assistant (8 cols) */}
      <div className="flex flex-col justify-between rounded-2xl border border-border/70 dark:border-border bg-card p-5 lg:col-span-8 shadow-2xs">
        <div>
          {/* Chat Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="grid size-9 place-items-center rounded-full bg-blue-500/20 dark:bg-blue-500/30 text-xs font-bold text-blue-600 dark:text-blue-400">
                  TA
                </div>
                <MessengerLogo className="absolute -bottom-1 -right-1 size-4 rounded-full border border-background shadow-xs" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-foreground">Tanvir Ahmed</h4>
                  <span className="rounded bg-blue-500/10 dark:bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-bold text-blue-600 dark:text-blue-400">
                    FB Messenger
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {isBn ? "সংযুক্ত পেজ:" : "Connected Page:"} <strong className="text-foreground">BikriPilot Store</strong> · {isBn ? "মেটা গ্রাফ API ভেরিফাইড" : "Meta Graph API Verified"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/15 dark:bg-emerald-500/25 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                {isBn ? "● পেজ AI অটো-পাইলট চালু" : "● Page AI Auto-Pilot ON"}
              </span>
            </div>
          </div>

          {/* Chat Body */}
          <div className="mt-4 space-y-3">
            {/* Customer Message via Facebook Page */}
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-muted/90 px-4 py-2.5 text-xs text-foreground shadow-2xs">
                <div className="mb-1 flex items-center justify-end gap-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                  <MessengerLogo className="size-3" />
                  <span>{isBn ? "ফেসবুক পেজের কাস্টমার" : "Customer on Facebook Page"}</span>
                </div>
                <p>
                  {isBn
                    ? "আসসালামু আলাইকুম ভাই, ব্ল্যাক কালার L সাইজের পাঞ্জাবিটা কি স্টকে আছে? ক্যাশ অন ডেলিভারিতে দেওয়া যাবে?"
                    : "Assalamu Alaikum bhai, Black color L size-er Panjabi ta ki stock-e ase? Cash on delivery-te deya jabe?"}
                </p>
              </div>
            </div>

            {/* AI Assistant Drafted Reply */}
            <div className="flex justify-start">
              <div className="max-w-[88%] rounded-2xl rounded-tl-xs border border-primary/40 bg-primary-soft/60 dark:bg-primary-soft/20 px-4 py-3 text-xs text-foreground shadow-xs">
                <div className="mb-1.5 flex items-center gap-1.5 text-primary">
                  <Bot className="size-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {isBn ? "বিক্রিপাইলট AI (পেজ মেসেঞ্জারে স্বয়ংক্রিয় রিপ্লাই)" : "BikriPilot AI (Auto-Replied to Page Messenger)"}
                  </span>
                </div>
                <p className="leading-relaxed">
                  {isBn
                    ? "ওয়ালাইকুম আসসালাম! জি ভাইয়া, প্রিমিয়াম ব্ল্যাক পাঞ্জাবি (সাইজ L) স্টকে রেডি আছে। মূল্য ১,৬৫০ টাকা। ঢাকার মধ্যে ২৪-৪৮ ঘণ্টার মধ্যে Steadfast/Pathao-তে ক্যাশ অন ডেলিভারি পাবেন।"
                    : "Walaikum Assalam! Ji bhai, Premium Black Panjabi (Size L) stock-e ready ase. Price ৳1,650। Dhakar moddhe 24-48 ghontar moddhe Steadfast/Pathao-te Cash on Delivery paben।"}
                </p>
                <p className="mt-1 font-bold text-primary">
                  {isBn
                    ? "অর্ডার কনফার্ম করতে আপনার মোবাইল নম্বর ও ডেলিভারি ঠিকানা লিখে দিন।"
                    : "Order confirm korte ki apnar phone number ar delivery address diben?"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="mt-5 border-t border-border/60 pt-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 dark:bg-blue-500/20 px-2.5 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                <MessengerLogo className="size-3" />
                <span>{isBn ? "মেটা পেজ ওয়েবহুক সক্রিয়" : "Meta Page Webhook Active"}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                <WhatsAppLogo className="size-3" />
                <span>{isBn ? "হোয়াটসঅ্যাপ ক্লাউড API প্রস্তুত" : "WhatsApp Cloud API Ready"}</span>
              </span>
            </div>
            <span className="text-[11px] font-medium text-muted-foreground">
              {isBn ? "আপনার পেজের সাথে সরাসরি সংযোগ" : "Direct connection with your business page"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   2. CHAT TO ORDER PREVIEW
   ========================================================================= */
function OrderExtractionPreview({ isBn }: { isBn: boolean }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Left: Raw Chat Text */}
      <div className="rounded-2xl border border-border/70 dark:border-border bg-card p-5 shadow-2xs">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <MessengerLogo className="size-4" />
            <span className="text-xs font-bold text-foreground">
              {isBn ? "ফেসবুক পেজ ইনবক্স" : "FB Page Inbox"}
            </span>
          </div>
          <span className="rounded bg-blue-500/10 dark:bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
            {isBn ? "পেজ কাস্টমার মেসেজ" : "Page Customer Message"}
          </span>
        </div>
        <div className="mt-4 rounded-xl border border-border/60 bg-muted/50 p-4 font-mono text-xs leading-relaxed text-foreground">
          {isBn ? (
            <>
              &quot;ভাই আমার নাম <strong className="font-semibold text-primary">তানভীর আহমেদ</strong>, ফোন{" "}
              <strong className="font-semibold text-primary">০১৭১১২৩৪৫৬৭</strong>। ডেলিভারি ঠিকানা:{" "}
              <strong className="font-semibold text-primary">বাড়ি ১২, রোড ৪, সেক্টর ৭, উত্তরা, ঢাকা</strong>। ১ পিস{" "}
              <strong className="font-semibold text-primary">ব্ল্যাক পাঞ্জাবি L সাইজ</strong> পাঠাবেন, ক্যাশ অন ডেলিভারিতে।&quot;
            </>
          ) : (
            <>
              &quot;Bhai amar nam <strong className="font-semibold text-primary">Tanvir Ahmed</strong>, phone{" "}
              <strong className="font-semibold text-primary">01711234567</strong>. Delivery address:{" "}
              <strong className="font-semibold text-primary">House 12, Road 4, Sector 7, Uttara, Dhaka</strong>. 1 piece{" "}
              <strong className="font-semibold text-primary">Black Panjabi L size</strong> pathayen, cash on delivery te.&quot;
            </>
          )}
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 p-3 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>
            {isBn
              ? "AI স্বয়ংক্রিয়ভাবে ১০০% নির্ভুল কাস্টমার ঠিকানা ও আইটেম বের করেছে।"
              : "AI automatically parsed 100% of customer address & items."}
          </span>
        </div>
      </div>

      {/* Right: Structured Auto-Generated Order Draft */}
      <div className="rounded-2xl border border-primary/40 bg-card p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="size-4 text-primary" />
            <span className="text-xs font-bold text-foreground">
              {isBn ? "স্বয়ংক্রিয় অর্ডার ড্রাফট" : "Auto-Extracted Order Draft"}
            </span>
          </div>
          <span className="rounded-full bg-emerald-500/15 dark:bg-emerald-500/25 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
            Order #OD-8812
          </span>
        </div>

        <div className="mt-4 space-y-2.5 text-xs">
          <div className="flex justify-between border-b border-border/40 pb-2">
            <span className="text-muted-foreground font-medium">{isBn ? "কাস্টমার:" : "Customer:"}</span>
            <span className="font-bold text-foreground">Tanvir Ahmed</span>
          </div>
          <div className="flex justify-between border-b border-border/40 pb-2">
            <span className="text-muted-foreground font-medium">{isBn ? "ফোন:" : "Phone:"}</span>
            <span className="font-mono font-bold text-foreground">01711-234567</span>
          </div>
          <div className="flex justify-between border-b border-border/40 pb-2">
            <span className="text-muted-foreground font-medium">{isBn ? "ঠিকানা:" : "Address:"}</span>
            <span className="font-medium text-foreground text-right max-w-[65%]">
              {isBn ? "বাড়ি ১২, রোড ৪, সেক্টর ৭, উত্তরা, ঢাকা" : "House 12, Road 4, Sector 7, Uttara, Dhaka"}
            </span>
          </div>
          <div className="flex justify-between border-b border-border/40 pb-2">
            <span className="text-muted-foreground font-medium">{isBn ? "পণ্য:" : "Item:"}</span>
            <span className="font-semibold text-foreground">
              {isBn ? "প্রিমিয়াম কটন পাঞ্জাবি (L) × ১" : "Premium Cotton Panjabi (L) × 1"}
            </span>
          </div>
          <div className="flex justify-between pt-1 text-sm font-bold">
            <span className="text-foreground">{isBn ? "সিওডি মোট টাকা:" : "COD Total Amount:"}</span>
            <span className="font-extrabold text-primary">
              {isBn ? "১,৭৩০ টাকা (১,৬৫০ + ৮০ ডেলিভারি)" : "৳1,730 (৳1,650 + ৳80 delivery)"}
            </span>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-border/60 bg-muted/40 p-2.5 text-center text-xs text-muted-foreground font-medium">
          {isBn
            ? "মার্চেন্ট পর্যালোচনার জন্য ম্যানুয়াল অনুমোদন তালিকায় পাঠানো হয়েছে"
            : "Passed to Manual Approval queue for merchant review"}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   3. MANUAL APPROVED PREVIEW (MERCHANT ORDER APPROVAL)
   ========================================================================= */
function ManualApprovalPreview({ isBn }: { isBn: boolean }) {
  return (
    <div className="space-y-4">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 dark:border-border bg-card p-4 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
            <UserCheck className="size-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">
              {isBn ? "ম্যানুয়াল অর্ডার অনুমোদন কিউ" : "Manual Order Approval Queue"}
            </h4>
            <p className="text-[10px] text-muted-foreground">
              {isBn ? "কুরিয়ারে পাঠানোর আগে AI ড্রাফটটি যাচাই করুন" : "Review AI drafts before sending to courier dispatch"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-amber-500/15 dark:bg-amber-500/25 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
            {isBn ? "● ১টি অপেক্ষমাণ" : "● 1 Pending Approval"}
          </span>
          <span className="rounded-full bg-emerald-500/15 dark:bg-emerald-500/25 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            {isBn ? "✓ ২৮টি আজ অনুমোদিত" : "✓ 28 Approved Today"}
          </span>
        </div>
      </div>

      {/* Order Under Review Card */}
      <div className="rounded-2xl border border-primary/30 bg-card p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div>
            <span className="text-xs font-bold text-foreground">Order #OD-8812</span>
            <span className="ml-2 inline-flex items-center gap-1 rounded bg-blue-500/10 dark:bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
              <MessengerLogo className="size-3" />
              <span>{isBn ? "ফেসবুক পেজ ইনবক্স থেকে" : "From FB Page Inbox"}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-500/15 dark:bg-emerald-500/25 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
              {isBn ? "✓ ঠিকানা যাচাইকৃত" : "✓ Address Verified"}
            </span>
            <span className="rounded-full bg-blue-500/15 dark:bg-blue-500/25 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
              {isBn ? "✓ ডুপ্লিকেট অর্ডার নেই" : "✓ No Duplicate Order"}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="mt-4 grid gap-4 sm:grid-cols-3 text-xs">
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              {isBn ? "ক্রেতার বিবরণ" : "Buyer Details"}
            </p>
            <p className="mt-1 font-bold text-foreground">Tanvir Ahmed</p>
            <p className="font-mono text-muted-foreground">01711-234567</p>
            <p className="mt-1 text-[11px] text-foreground/80">
              {isBn ? "উত্তরা সেক্টর ৭, ঢাকা" : "Uttara Sector 7, Dhaka"}
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              {isBn ? "অর্ডারকৃত পণ্য" : "Ordered Products"}
            </p>
            <p className="mt-1 font-semibold text-foreground">
              {isBn ? "প্রিমিয়াম পাঞ্জাবি (L)" : "Premium Panjabi (L)"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {isBn ? "পরিমাণ: ১ · মূল্য: ৳১,৬৫০" : "Qty: 1 · Price: ৳1,650"}
            </p>
            <p className="mt-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              {isBn ? "স্টক অবস্থা: ৮টি স্টকে আছে" : "Stock Status: 8 in stock"}
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              {isBn ? "পেমেন্ট ও সিওডি" : "Payment & COD"}
            </p>
            <p className="mt-1 text-base font-extrabold text-primary">৳1,730</p>
            <p className="text-[10px] text-muted-foreground">
              {isBn ? "ডেলিভারি: ৮০ টাকা (Steadfast)" : "Delivery: ৳80 (Steadfast)"}
            </p>
            <p className="mt-1 text-[10px] font-semibold text-foreground">
              {isBn ? "ক্যাশ অন ডেলিভারি (COD)" : "Cash On Delivery (COD)"}
            </p>
          </div>
        </div>

        {/* Approval Actions Bar */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileCheck className="size-4 text-emerald-500" />
            <span>{isBn ? "মার্চেন্ট নিশ্চিতকরণের জন্য প্রস্তুত" : "Ready for merchant confirmation"}</span>
          </div>

          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1 rounded-xl border border-danger/40 bg-danger/10 px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger/20 transition-colors">
              <XCircle className="size-3.5" />
              <span>{isBn ? "বাতিল" : "Reject"}</span>
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity">
              <Check className="size-3.5" />
              <span>{isBn ? "✓ অনুমোদন ও কুরিয়ারে বুকিং" : "✓ Approve & Move to Courier"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   4. FRAUD & RISK RADAR PREVIEW
   ========================================================================= */
function RiskRadarPreview({ isBn }: { isBn: boolean }) {
  return (
    <div className="grid gap-6 md:grid-cols-12">
      {/* Left Risk Meter (5 cols) */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border/70 dark:border-border bg-card p-6 text-center md:col-span-5 shadow-2xs">
        <div className="relative grid size-32 place-items-center rounded-full border-8 border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/20">
          <div>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">96%</p>
            <p className="text-[10px] font-bold uppercase text-muted-foreground">
              {isBn ? "সফলতার হার" : "Success Rate"}
            </p>
          </div>
        </div>
        <h4 className="mt-4 text-sm font-bold text-foreground">
          {isBn ? "কম রিটার্ন ঝুঁকি" : "Low Return Risk"}
        </h4>
        <p className="mt-1 text-xs text-muted-foreground">
          {isBn
            ? "বিক্রিপাইলট নেটওয়ার্কের ১৮টি পার্টনার দোকানে বিশ্বস্ত ক্রেতা।"
            : "Safe buyer across 18 partner shops on BikriPilot network."}
        </p>
        <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 dark:bg-emerald-500/25 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          <Check className="size-3.5" /> {isBn ? "১০০% COD নিরাপদ" : "100% COD Safe"}
        </span>
      </div>

      {/* Right Search & History (7 cols) */}
      <div className="rounded-2xl border border-border/70 dark:border-border bg-card p-5 md:col-span-7 shadow-2xs">
        <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-xs">
          <Search className="size-4 text-muted-foreground" />
          <span className="font-mono font-bold text-foreground">01711-234567</span>
          <span className="ml-auto rounded bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold text-primary">
            {isBn ? "যাচাইকৃত" : "Verified"}
          </span>
        </div>

        <div className="mt-5 space-y-3 text-xs">
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground font-medium">
                {isBn ? "নেটওয়ার্কে মোট অর্ডার:" : "Total Orders Across Network:"}
              </span>
              <span className="font-bold text-foreground">
                {isBn ? "৩৪টি ডেলিভারি" : "34 Deliveries"}
              </span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-muted-foreground font-medium">
                {isBn ? "সফল ডেলিভারি:" : "Successful Deliveries:"}
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">33 (97.1%)</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-muted-foreground font-medium">
                {isBn ? "রিটার্ন / বাতিল:" : "Returns / Cancellations:"}
              </span>
              <span className="font-bold text-foreground">
                {isBn ? "১ (কাস্টমার বিদেশে ছিলেন)" : "1 (Customer was abroad)"}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/20 p-3 text-emerald-800 dark:text-emerald-200">
            <p className="font-bold text-xs">{isBn ? "AI পরামর্শ:" : "AI Recommendation:"}</p>
            <p className="mt-0.5 text-[11px] leading-relaxed">
              {isBn
                ? "অগ্রিম ডেলিভারি চার্জ নেওয়ার প্রয়োজন নেই। কাস্টমারের পার্সেল রিসিভ করার অসাধারণ ট্র্যাক রেকর্ড রয়েছে।"
                : "No need to take advance delivery charge. Customer has an exceptional track record of accepting parcels upon delivery."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   5. COURIER DISPATCH PREVIEW
   ========================================================================= */
function CourierPreview({ isBn }: { isBn: boolean }) {
  return (
    <div className="space-y-4">
      {/* Top Courier Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-2xl border border-border/70 dark:border-border bg-card p-4 shadow-2xs">
          <SteadfastLogo className="size-8 rounded-lg" />
          <div>
            <p className="text-[10px] font-medium text-muted-foreground">Steadfast Courier</p>
            <p className="text-base font-extrabold text-foreground">{isBn ? "৮৪টি পার্সেল" : "84 Parcels"}</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {isBn ? "লাইভ API সংযুক্ত" : "Live API Connected"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-border/70 dark:border-border bg-card p-4 shadow-2xs">
          <PathaoLogo className="size-8 rounded-lg" />
          <div>
            <p className="text-[10px] font-medium text-muted-foreground">Pathao Courier</p>
            <p className="text-base font-extrabold text-foreground">{isBn ? "৪২টি পার্সেল" : "42 Parcels"}</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {isBn ? "মার্চেন্ট সিঙ্ক সক্রিয়" : "Merchant Sync Active"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-border/70 dark:border-border bg-card p-4 shadow-2xs">
          <RedXLogo className="size-8 rounded-lg" />
          <div>
            <p className="text-[10px] font-medium text-muted-foreground">RedX Courier</p>
            <p className="text-base font-extrabold text-foreground">{isBn ? "২২টি পার্সেল" : "22 Parcels"}</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {isBn ? "সরাসরি API সংযুক্ত" : "Direct API Connected"}
            </p>
          </div>
        </div>
      </div>

      {/* Live Dispatches Table */}
      <div className="overflow-hidden rounded-2xl border border-border/70 dark:border-border bg-card shadow-2xs">
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-2.5 text-xs font-bold text-foreground">
          <span>{isBn ? "চলমান পার্সেল (রিয়েল-টাইম ট্র্যাকিং)" : "Active Consignments (Real-time Webhook Tracking)"}</span>
          <span className="text-primary font-semibold">
            {isBn ? "COD টাকা সরাসরি হিসাব খাতায় যুক্ত হয়" : "Auto-reconciles COD to Hisab Khata"}
          </span>
        </div>
        <div className="divide-y divide-border/40 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 sm:px-4">
            <div>
              <span className="font-mono font-bold text-foreground">SF-902184</span>
              <span className="ml-2 text-muted-foreground">
                {isBn ? "তানভীর আহমেদ (উত্তরা, ঢাকা)" : "Tanvir Ahmed (Uttara, Dhaka)"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-foreground">৳1,730 COD</span>
              <span className="rounded-full bg-blue-500/15 dark:bg-blue-500/25 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                {isBn ? "ডেলিভারির পথে" : "Out for Delivery"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 p-3 sm:px-4">
            <div>
              <span className="font-mono font-bold text-foreground">PT-441890</span>
              <span className="ml-2 text-muted-foreground">
                {isBn ? "নুসরাত জাহান (আগ্রাবাদ, চট্টগ্রাম)" : "Nusrat Jahan (Agrabad, CTG)"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-foreground">৳2,850 COD</span>
              <span className="rounded-full bg-amber-500/15 dark:bg-amber-500/25 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                {isBn ? "ট্রানজিটে আছে (হাব-২)" : "In Transit (Hub-2)"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 p-3 sm:px-4">
            <div>
              <span className="font-mono font-bold text-foreground">RX-771203</span>
              <span className="ml-2 text-muted-foreground">
                {isBn ? "ফারহান কবির (জিন্দাবাজার, সিলেট)" : "Farhan Kabir (Zindabazar, Sylhet)"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">৳1,200 COD</span>
              <span className="rounded-full bg-emerald-500/15 dark:bg-emerald-500/25 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                {isBn ? "✓ ডেলিভার্ড ও পেইড" : "✓ Delivered & Paid"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 p-3 sm:px-4">
            <div>
              <span className="font-mono font-bold text-foreground">SF-905541</span>
              <span className="ml-2 text-muted-foreground">
                {isBn ? "মেহনাজ পারভীন (ধানমন্ডি, ঢাকা)" : "Mehnaz Parvin (Dhanmondi, Dhaka)"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-foreground">৳3,450 COD</span>
              <span className="rounded-full bg-primary/15 dark:bg-primary/25 px-2 py-0.5 text-[10px] font-bold text-primary dark:text-primary-light">
                {isBn ? "পিকআপের জন্য প্রস্তুত" : "Ready for Pickup"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   6. HISAB KHATA (LIVING LEDGER) PREVIEW
   ========================================================================= */
function HisabKhataPreview({ isBn }: { isBn: boolean }) {
  return (
    <div className="space-y-4">
      {/* 4 Metric Cards - 2x2 on mobile, 4 across on desktop */}
      <div className="grid gap-2.5 sm:gap-3 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border/70 dark:border-border bg-card p-4 shadow-2xs">
          <p className="text-[11px] font-medium text-muted-foreground">
            {isBn ? "আজকের মোট বিক্রি" : "Today's Sales"}
          </p>
          <p className="mt-1 text-xl font-extrabold text-foreground">৳42,850</p>
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            {isBn ? "গতকাল থেকে +১৮%" : "+18% from yesterday"}
          </span>
        </div>
        <div className="rounded-2xl border border-border/70 dark:border-border bg-card p-4 shadow-2xs">
          <p className="text-[11px] font-medium text-muted-foreground">
            {isBn ? "কুরিয়ারের কাছে বকেয়া COD" : "Courier COD Pending"}
          </p>
          <p className="mt-1 text-xl font-extrabold text-amber-600 dark:text-amber-400">৳1,14,200</p>
          <span className="text-[10px] font-medium text-muted-foreground">
            {isBn ? "প্রতিদিন স্বয়ংক্রিয় মিলন" : "Auto-matching daily"}
          </span>
        </div>
        <div className="rounded-2xl border border-border/70 dark:border-border bg-card p-4 shadow-2xs">
          <p className="text-[11px] font-medium text-muted-foreground">
            {isBn ? "বিকাশ / নগদ প্রাপ্ত" : "bKash / Nagad Received"}
          </p>
          <p className="mt-1 text-xl font-extrabold text-foreground">৳28,400</p>
          <span className="text-[10px] font-semibold text-primary">
            {isBn ? "অর্ডারের সাথে সমন্বিত" : "Reconciled to orders"}
          </span>
        </div>
        <div className="rounded-2xl border border-primary/40 bg-primary-soft/40 dark:bg-primary-soft/20 p-4 shadow-2xs">
          <p className="text-[11px] font-medium text-primary">
            {isBn ? "আনুমানিক নিট লাভ" : "Estimated Net Profit"}
          </p>
          <p className="mt-1 text-xl font-extrabold text-primary">৳18,650</p>
          <span className="text-[10px] font-semibold text-primary">
            {isBn ? "রিয়েল-টাইম খাতা" : "Real-time ledger"}
          </span>
        </div>
      </div>

      {/* Ledger Journal Entries */}
      <div className="rounded-2xl border border-border/70 dark:border-border bg-card p-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-border/60 pb-2 text-xs font-bold text-foreground">
          <span>{isBn ? "সাম্প্রতিক স্বয়ংক্রিয় এন্ট্রি (হিসাব খাতা)" : "Recent Automated Entries (Hisab Khata)"}</span>
          <span className="text-muted-foreground font-medium">
            {isBn ? "খাতায় হাতে লেখার কোনো ঝামেলা নেই" : "Zero manual notebook entry"}
          </span>
        </div>
        <div className="mt-3 space-y-2 text-xs">
          <div className="flex items-center justify-between rounded-xl bg-muted/40 p-2.5">
            <div>
              <p className="font-bold text-foreground">
                {isBn ? "Steadfast কুরিয়ার COD পে-আউট (ব্যাচ #SF-392)" : "Steadfast Courier COD Payout (Batch #SF-392)"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {isBn ? "ব্যাংক অ্যাকাউন্টে স্বয়ংক্রিয় জমা হয়েছে" : "Auto-deposited into City Bank Account"}
              </p>
            </div>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+৳24,500</span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-muted/40 p-2.5">
            <div>
              <p className="font-bold text-foreground">
                {isBn ? "অর্ডার #OD-8812 ডেলিভার্ড (তানভীর আহমেদ)" : "Order #OD-8812 Delivered (Tanvir Ahmed)"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {isBn ? "কাস্টমার ক্যাশ পরিশোধ করেছে" : "Customer COD cash received by courier"}
              </p>
            </div>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+৳1,730</span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-muted/40 p-2.5">
            <div>
              <p className="font-bold text-foreground">
                {isBn ? "কুরিয়ার ডেলিভারি ফি কর্তন" : "Courier Delivery Fee Deduction"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {isBn ? "Steadfast ডেলিভারি চার্জ (ঢাকা সিটি)" : "Steadfast Delivery Charge (Inside Dhaka)"}
              </p>
            </div>
            <span className="font-mono font-bold text-rose-600 dark:text-rose-400">-৳80</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   7. SMS & EMAIL AUTO NOTIFICATIONS PREVIEW
   ========================================================================= */
function SmsEmailPreview({ isBn }: { isBn: boolean }) {
  return (
    <div className="grid gap-4 md:grid-cols-12 items-stretch">
      {/* Left: Trigger Rules (5 cols) */}
      <div className="flex flex-col justify-between rounded-2xl border border-border/70 dark:border-border bg-card p-4 sm:p-5 md:col-span-5 shadow-2xs">
        <div>
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                <BellRing className="size-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">
                  {isBn ? "স্বয়ংক্রিয় স্ট্যাটাস নোটিফিকেশন" : "Auto Status Broadcast"}
                </h4>
                <p className="text-[10px] text-muted-foreground">
                  {isBn ? "অর্ডার স্ট্যাটাস পরিবর্তনের সাথে সাথে প্রেরিত" : "Triggered on seller status update"}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-500/15 dark:bg-emerald-500/25 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
              {isBn ? "● ২টি নিয়ম সক্রিয়" : "● 2 Rules Active"}
            </span>
          </div>

          {/* 2 Trigger Automation Rules */}
          <div className="mt-3.5 space-y-2.5 text-xs">
            {/* Rule 1 */}
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
              <div className="flex items-center justify-between">
                <span className="rounded bg-blue-500/10 dark:bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                  {isBn ? "স্ট্যাটাস: অর্ডার নিশ্চিত" : "Status: Order Confirmed"}
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {isBn ? "স্বয়ংক্রিয় প্রেরিত" : "Auto-sent"}
                </span>
              </div>
              <p className="mt-1.5 text-[11px] text-foreground font-medium">
                {isBn
                  ? "কাস্টমার ইনভয়েস নিশ্চিতকরণ ও হিসাব পেয়েছেন।"
                  : "Customer receives invoice confirmation & breakdown."}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="rounded-md border border-blue-500/30 bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-blue-600 dark:text-blue-400">
                  ✓ FB Page
                </span>
                <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                  ✓ WhatsApp
                </span>
                <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700 dark:text-amber-300">
                  ✓ SMS
                </span>
              </div>
            </div>

            {/* Rule 2 */}
            <div className="rounded-xl border border-primary/40 bg-primary-soft/30 dark:bg-primary-soft/15 p-3">
              <div className="flex items-center justify-between">
                <span className="rounded bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                  {isBn ? "স্ট্যাটাস: কুরিয়ারে বুকিং সম্পন্ন" : "Status: Courier Dispatched"}
                </span>
                <span className="text-[10px] font-bold text-primary">
                  {isBn ? "অগ্রাধিকার" : "Priority"}
                </span>
              </div>
              <p className="mt-1.5 text-[11px] text-foreground font-medium">
                {isBn
                  ? "কনসাইনমেন্ট আইডি ও লাইভ ট্র্যাকিং লিংক পাঠানো হয়েছে।"
                  : "Consignment ID & live Steadfast tracking link sent."}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="rounded-md border border-blue-500/30 bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-blue-600 dark:text-blue-400">
                  ✓ FB Page
                </span>
                <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                  ✓ WhatsApp
                </span>
                <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700 dark:text-amber-300">
                  ✓ SMS
                </span>
                <span className="rounded-md border border-purple-500/30 bg-purple-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-purple-700 dark:text-purple-300">
                  ✓ Email
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-border/60 bg-muted/40 p-2 text-[10px] text-muted-foreground">
          {isBn ? (
            <>
              💡 <strong className="text-foreground">বিক্রেতার নিয়ন্ত্রণ:</strong> ফোন নম্বর ও ইমেইল অনুযায়ী স্বয়ংক্রিয় চ্যানেল নির্বাচন।
            </>
          ) : (
            <>
              💡 <strong className="text-foreground">Seller Control:</strong> Channels auto-switch based on customer phone &amp; email.
            </>
          )}
        </div>
      </div>

      {/* Right: What Customer Receives in Real-Time (7 cols) */}
      <div className="flex flex-col justify-between rounded-2xl border border-border/70 dark:border-border bg-card p-4 sm:p-5 md:col-span-7 shadow-2xs">
        <div className="space-y-3">
          {/* 1. FB Page Inbox / WhatsApp Notification */}
          <div className="rounded-xl border border-blue-500/30 dark:border-blue-500/40 bg-blue-500/5 dark:bg-blue-500/10 p-3.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <div className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400 text-[11px]">
                <MessengerLogo className="size-3.5" />
                <span>
                  {isBn
                    ? "ফেসবুক পেজ ইনবক্স ও হোয়াটসঅ্যাপ স্বয়ংক্রিয় নোটিফিকেশন"
                    : "Facebook Page Inbox & WhatsApp Auto-Update"}
                </span>
              </div>
              <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-300">
                {isBn ? "✓ স্বয়ংক্রিয় প্রেরিত" : "✓ Auto-Sent to Buyer"}
              </span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-foreground">
              {isBn ? (
                <>
                  &quot;📦 <strong>BikriPilot Store:</strong> প্রিয় Tanvir Ahmed, আপনার অর্ডার <strong>#OD-8812</strong> কুরিয়ারে হস্তান্তর করা হয়েছে!
                  <br />
                  কুরিয়ার: <strong>Steadfast</strong> · ট্র্যাকিং: <span className="font-mono font-bold text-primary">SF-902184</span> · COD: <strong>৳১,৭৩০</strong>&quot;
                </>
              ) : (
                <>
                  &quot;📦 <strong>BikriPilot Store:</strong> Dear Tanvir Ahmed, your order <strong>#OD-8812</strong> has been dispatched!
                  <br />
                  Courier: <strong>Steadfast</strong> · Tracking: <span className="font-mono font-bold text-primary">SF-902184</span> · COD: <strong>৳1,730</strong>&quot;
                </>
              )}
            </p>
          </div>

          {/* 2. Customer Email Receipt (If email exists) */}
          <div className="rounded-xl border border-purple-500/30 dark:border-purple-500/40 bg-purple-500/5 dark:bg-purple-500/10 p-3.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <div className="flex items-center gap-1.5 font-bold text-purple-700 dark:text-purple-300 text-[11px]">
                <Mail className="size-3.5" />
                <span>
                  {isBn
                    ? "কাস্টমার অর্ডার ইমেইল রসিদ (ইমেইল দেওয়া থাকলে)"
                    : "Customer Order Email Receipt (If Email Available)"}
                </span>
              </div>
              <span className="rounded bg-purple-500/15 px-1.5 py-0.5 text-[9px] font-bold text-purple-700 dark:text-purple-300">
                {isBn ? "✓ ট্র্যাকিং সক্রিয়" : "✓ HTML Tracking"}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <div>
                <p className="font-bold text-foreground">
                  {isBn
                    ? "বিষয়: অর্ডার #OD-8812 পাঠানো হয়েছে — BikriPilot Store"
                    : "Subject: Order #OD-8812 Dispatched — BikriPilot Store"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {isBn
                    ? "প্রাপক: tanvir@email.com · অবস্থা: ডেলিভারির পথে"
                    : "To: tanvir@email.com · Status: In Transit"}
                </p>
              </div>
              <span className="font-mono font-bold text-primary">৳1,730 COD</span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-[10px] text-muted-foreground">
          <span>
            {isBn
              ? "কাস্টমারের কোনো বিভ্রান্তি নেই · স্ট্যাটাস পরিবর্তনের সাথে সাথে লাইভ ট্র্যাকিং"
              : "Zero customer confusion · Auto-tracking on order status update"}
          </span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            {isBn ? "✓ মাল্টি-চ্যানেল সিঙ্ক" : "✓ Multi-Channel Sync"}
          </span>
        </div>
      </div>
    </div>
  );
}
