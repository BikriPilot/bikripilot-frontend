import {
  BadgeCheck,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Logo } from "@/components/common/Logo";
import { FacebookLogo, LinkedInLogo } from "@/components/landing/IntegrationLogos";
import type { PublicConfig } from "@/types/publicConfig";

export async function PublicFooter({
  config,
}: {
  config: PublicConfig | null;
}) {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("landing"),
  ]);
  const isBn = locale === "bn";

  return (
    <footer className="border-t bg-card text-card-foreground">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Brand & Address Column (4 cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-8">
            <div>
              <div className="flex items-center gap-2">
                <Logo />
              </div>
              <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                {t("footerAbout")}
              </p>

              {/* Trust Badges (Positioned ABOVE Headquarters card for symmetrical alignment) */}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-md border bg-muted/40 px-2.5 py-1">
                  <BadgeCheck className="size-3 text-primary" />
                  <span>{t("footerMetaPartner")}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md border bg-muted/40 px-2.5 py-1">
                  <ShieldCheck className="size-3 text-emerald-600" />
                  <span>{isBn ? "AES-256 সুরক্ষিত" : "AES-256 Secured"}</span>
                </span>
              </div>

              {/* Dynamic Admin/Backend Config Contact Links */}
              {config?.supportPhone || config?.supportWhatsapp ? (
                <div className="mt-4 space-y-2 text-xs">
                  {config?.supportPhone ? (
                    <a
                      href={`tel:${config.supportPhone}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Phone className="size-3.5 text-primary shrink-0" />
                      <span>{config.supportPhone}</span>
                    </a>
                  ) : null}

                  {config?.supportWhatsapp ? (
                    <a
                      href={`https://wa.me/${config.supportWhatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <MessageCircle className="size-3.5 text-emerald-600 shrink-0" />
                      <span>WhatsApp: {config.supportWhatsapp}</span>
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>

            {/* Official Headquarters Physical Address (at bottom, aligned with Official Desk card) */}
            <div className="rounded-xl border bg-muted/30 p-4 text-xs">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <MapPin className="size-4 text-primary shrink-0" />
                <span>{t("footerAddressLabel")}</span>
              </div>
              <p className="mt-1.5 pl-6 leading-5 text-muted-foreground">
                {t("footerAddress")}
              </p>
            </div>
          </div>

          {/* Navigation Links Columns & Direct Desk (8 cols) */}
          <div className="lg:col-span-8 flex flex-col justify-between gap-8">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              {/* Column 1: Product */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  {t("footerProduct")}
                </p>
                <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                  <li>
                    <Link href="/features" className="hover:text-foreground transition-colors">
                      {t("navFeatures")}
                    </Link>
                  </li>
                  <li>
                    <Link href="/how-it-works" className="hover:text-foreground transition-colors">
                      {t("navHow")}
                    </Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="hover:text-foreground transition-colors">
                      {t("navPricing")}
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="hover:text-foreground transition-colors">
                      {t("navLogin")}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 2: Resources & Support */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  {t("footerSupport")}
                </p>
                <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                  <li>
                    <Link href="/faq" className="hover:text-foreground transition-colors">
                      {t("navFaq")}
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-foreground transition-colors">
                      {t("footerContact")}
                    </Link>
                  </li>
                  <li>
                    <Link href="/track" className="hover:text-foreground transition-colors">
                      {t("footerTracking")}
                    </Link>
                  </li>
                  <li>
                    <Link href="/how-it-works" className="hover:text-foreground transition-colors">
                      {isBn ? "কাজের নিয়ম ও গাইড" : "Workflow Guide"}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 3: Legal & Compliance */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  {t("footerLegal")}
                </p>
                <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                  <li>
                    <Link href="/terms" className="hover:text-foreground transition-colors">
                      {t("footerTermsAndPrivacy") || "Terms & Privacy"}
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs" className="hover:text-foreground transition-colors">
                      {t("footerDocs") || "Docs"}
                    </Link>
                  </li>
                  <li>
                    <Link href="/data-deletion" className="hover:text-foreground transition-colors">
                      {t("footerDeletion")}
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="hover:text-foreground transition-colors">
                      {isBn ? "নিরাপত্তা ও ডেটা পলিসি" : "Security & Data"}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Direct Contact & Social Channels Box (Aligned with Support column, same width as Headquarters card) */}
            <div className="sm:grid sm:grid-cols-3 sm:gap-8">
              <div className="hidden sm:block" />
              <div className="w-full sm:max-w-[392px] rounded-xl border bg-muted/30 p-4 text-xs sm:col-span-2">
                <div className="flex items-start justify-between gap-3">
                  {/* Left Column: Official Desk Title & support@ Email */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <Mail className="size-4 text-primary shrink-0" />
                      <span className="truncate">{t("footerDirectDesk")}</span>
                    </div>
                    <div className="mt-1.5 pl-5.5">
                      <a
                        href="mailto:support@bikripilot.com"
                        className="text-muted-foreground hover:text-foreground hover:underline transition-colors font-medium leading-5 text-[11.5px]"
                      >
                        support@bikripilot.com
                      </a>
                    </div>
                  </div>

                  {/* Right Column: FB & LinkedIn Icons directly above founder@ Email */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0 pl-3.5 border-l border-border/50">
                    <div className="flex items-center gap-2">
                      <a
                        href="https://www.facebook.com/bikripilot"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="BikriPilot on Facebook"
                        className="inline-flex size-6 items-center justify-center rounded-md border bg-card text-muted-foreground shadow-2xs transition-all hover:bg-muted hover:scale-105"
                      >
                        <FacebookLogo className="size-3.5" />
                      </a>
                      <a
                        href="https://www.linkedin.com/company/bikripilot"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="BikriPilot on LinkedIn"
                        className="inline-flex size-6 items-center justify-center rounded-md border bg-card text-muted-foreground shadow-2xs transition-all hover:bg-muted hover:scale-105"
                      >
                        <LinkedInLogo className="size-3.5" />
                      </a>
                    </div>
                    <div>
                      <a
                        href="mailto:founder@bikripilot.com"
                        className="text-muted-foreground hover:text-foreground hover:underline transition-colors font-medium leading-5 text-[11.5px]"
                      >
                        founder@bikripilot.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Footer / Copyright & Status */}
      <div className="border-t bg-muted/20 px-5 py-6 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
              </span>
              <span>{t("footerStatus")}</span>
            </div>
            <span>·</span>
            <span>{isBn ? "ক্লাউড ইনফ্রাস্ট্রাকচার" : "Cloud Infrastructure"}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
