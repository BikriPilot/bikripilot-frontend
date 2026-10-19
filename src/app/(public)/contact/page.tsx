import {
  BadgeCheck,
  Mail,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { FacebookLogo, LinkedInLogo } from "@/components/landing/IntegrationLogos";
import { ContactFormClient } from "./ContactFormClient";

export const metadata = {
  title: "Contact & Support — BikriPilot",
  description:
    "Get in touch with the BikriPilot team. 24/7 dedicated assistance for Facebook Messenger automation, courier integrations, and merchant onboarding in Bangladesh.",
};

export default async function ContactPage() {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("landing"),
  ]);
  const isBn = locale === "bn";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-border/80 bg-muted/20 py-16 sm:py-20">
        <div className="absolute inset-0 bg-radial-[circle_at_top,_var(--tw-gradient-stops)] from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
              {t("contactHeroTitle")}
            </h1>
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-muted-foreground">
              {t("contactHeroDesc")}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area: Form & Contact Channels */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-12 items-stretch">
            {/* Left Column: Interactive Contact Form (7 cols) */}
            <div className="lg:col-span-7 flex flex-col">
              <ContactFormClient
                t={{
                  contactFormTitle: t("contactFormTitle"),
                  contactFormDesc: t("contactFormDesc"),
                  contactNameLabel: t("contactNameLabel"),
                  contactEmailLabel: t("contactEmailLabel"),
                  contactPhoneLabel: t("contactPhoneLabel"),
                  contactTopicLabel: t("contactTopicLabel"),
                  contactMessageLabel: t("contactMessageLabel"),
                  contactAttachLabel: t("contactAttachLabel"),
                  contactAttachDesc: t("contactAttachDesc"),
                  contactSubmitBtn: t("contactSubmitBtn"),
                  contactSendingBtn: t("contactSendingBtn"),
                  contactSuccessTitle: t("contactSuccessTitle"),
                  contactSuccessDesc: t("contactSuccessDesc"),
                  contactTicketAssigned: t("contactTicketAssigned"),
                  contactSendAnother: t("contactSendAnother"),
                  contactGeneralInquiry: t("contactGeneralInquiry"),
                  contactPageSetup: t("contactPageSetup"),
                  contactCourierSync: t("contactCourierSync"),
                  contactBillingPlan: t("contactBillingPlan"),
                  contactBugIssue: t("contactBugIssue"),
                }}
              />
            </div>

            {/* Right Column: 3 Cards Matching Left Column Height (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-5 h-full">
              {/* 1. Official Desk & Channels Card */}
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-border/60">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Mail className="size-4" />
                    </div>
                    <span>{t("footerDirectDesk")}</span>
                  </div>
                  {/* Social Channel Icons (Facebook & LinkedIn) */}
                  <div className="flex items-center gap-2">
                    <a
                      href="https://www.facebook.com/bikripilot"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="BikriPilot on Facebook"
                      className="inline-flex size-8 items-center justify-center rounded-lg border bg-card text-muted-foreground shadow-2xs transition-all hover:bg-muted hover:scale-105"
                      title="Visit official Facebook Page"
                    >
                      <FacebookLogo className="size-4" />
                    </a>
                    <a
                      href="https://www.linkedin.com/in/tarekmonowar"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Tarek Monowar on LinkedIn"
                      className="inline-flex size-8 items-center justify-center rounded-lg border bg-card text-muted-foreground shadow-2xs transition-all hover:bg-muted hover:scale-105"
                      title="Visit LinkedIn Profile"
                    >
                      <LinkedInLogo className="size-4" />
                    </a>
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-xs">
                  {/* Support Desk Email */}
                  <div className="flex items-start justify-between rounded-xl border bg-muted/30 p-3.5">
                    <div>
                      <p className="font-semibold text-foreground">
                        {isBn ? "টেকনিক্যাল সাপোর্ট ডেস্ক" : "Technical Support Desk"}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {isBn
                          ? "বাগ রিপোর্ট, শপ অনবোর্ডিং ও ইন্টিগ্রেশন সহায়তা"
                          : "For bugs, shop onboarding & integration help"}
                      </p>
                    </div>
                    <a
                      href="mailto:support@bikripilot.com"
                      className="font-medium text-primary hover:underline self-center"
                    >
                      support@bikripilot.com
                    </a>
                  </div>

                  {/* Founder Desk Email */}
                  <div className="flex items-start justify-between rounded-xl border bg-muted/30 p-3.5">
                    <div>
                      <p className="font-semibold text-foreground">
                        {isBn ? "ফাউন্ডার ও এক্সিকিউটিভ ডেস্ক" : "Founder & Executive Desk"}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {isBn
                          ? "পার্টনারশিপ, কাস্টম প্ল্যান ও ব্যবসায়িক ফিডব্যাক"
                          : "For partnerships, custom plans & feedback"}
                      </p>
                    </div>
                    <a
                      href="mailto:founder@bikripilot.com"
                      className="font-medium text-primary hover:underline self-center"
                    >
                      founder@bikripilot.com
                    </a>
                  </div>
                </div>
              </div>

              {/* 2. Physical Headquarters & Compliance (In the middle) */}
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-foreground mb-3">
                  <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                    <MapPin className="size-4" />
                  </div>
                  <span>{t("footerAddressLabel")}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pl-10">
                  {t("footerAddress")}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-2 pt-4 border-t border-border/60 text-[11px] font-medium text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 rounded-md border bg-muted/40 px-2 py-1">
                    <BadgeCheck className="size-3 text-primary" />
                    <span>{t("footerMetaPartner")}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-md border bg-muted/40 px-2 py-1">
                    <ShieldCheck className="size-3 text-emerald-600" />
                    <span>{isBn ? "AES-256 সুরক্ষিত" : "AES-256 Secured"}</span>
                  </span>
                </div>
              </div>

              {/* 3. Founder Profile Card (Larger image and prominent details) */}
              <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
                  {/* Prominent Portrait Image (96px mobile, 112px desktop) */}
                  <div className="relative size-24 sm:size-28 shrink-0 overflow-hidden rounded-2xl border-2 border-primary/30 bg-muted shadow-md ring-4 ring-primary/10">
                    <Image
                      src="/images/Tarek-Monowar-Fullstack-developer.png"
                      alt="Tarek Monowar"
                      width={112}
                      height={112}
                      priority
                      className="size-full object-cover object-top"
                    />
                  </div>

                  {/* Founder Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
                        Tarek Monowar
                      </h3>
                      <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {isBn ? "প্রতিষ্ঠাতা" : "Founder"}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                      <MapPin className="size-3.5 text-primary/70 shrink-0" />
                      <span>{isBn ? "সিলেট, বাংলাদেশ" : "Sylhet, Bangladesh"}</span>
                    </p>

                    {/* Action Links: Personal LinkedIn & Direct Email */}
                    <div className="mt-4 flex flex-wrap items-center gap-2.5">
                      <a
                        href="https://www.linkedin.com/in/tarekmonowar"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Tarek Monowar on LinkedIn"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-muted/40 px-3.5 py-2 text-xs font-semibold text-foreground transition-all hover:border-[#0A66C2]/40 hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]"
                      >
                        <LinkedInLogo className="size-3.5" />
                        <span>{isBn ? "লিংকডইন প্রোফাইল" : "LinkedIn Profile"}</span>
                      </a>
                      <a
                        href="mailto:founder@bikripilot.com"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-muted/40 px-3.5 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted hover:text-primary"
                      >
                        <Mail className="size-3.5 text-primary" />
                        <span>founder@bikripilot.com</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
