import {
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/common/Logo";
import type { PublicConfig } from "@/types/publicConfig";

export async function PublicFooter({
  config,
}: {
  config: PublicConfig | null;
}) {
  const t = await getTranslations("landing");

  return (
    <footer className="border-t bg-card text-card-foreground">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Brand & Address Column (5 cols) */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2">
              <Logo />
            </div>
            <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
              {t("footerAbout")}
            </p>

            {/* Official Headquarters Physical Address (for AWS, Meta & KYC verification) */}
            <div className="mt-5 rounded-xl border bg-muted/30 p-4 text-xs">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <MapPin className="size-4 text-primary shrink-0" />
                <span>{t("footerAddressLabel")}</span>
              </div>
              <p className="mt-1.5 pl-6 leading-5 text-muted-foreground">
                {t("footerAddress")}
              </p>
            </div>

            {/* Dynamic Admin/Backend Config Contact Links */}
            <div className="mt-5 space-y-2 text-xs">
              {config?.supportEmail ? (
                <a
                  href={`mailto:${config.supportEmail}`}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="size-3.5 text-primary shrink-0" />
                  <span>{config.supportEmail}</span>
                </a>
              ) : null}

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

              {config?.facebookPageUrl ? (
                <a
                  href={config.facebookPageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="size-3.5 text-primary shrink-0" />
                  <span>{t("footerFacebook")}</span>
                </a>
              ) : null}
            </div>

            {/* Trust Badges */}
            <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-md border bg-muted/40 px-2 py-1">
                <Sparkles className="size-3 text-primary" />
                <span>{t("footerMetaPartner")}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border bg-muted/40 px-2 py-1">
                <ShieldCheck className="size-3 text-emerald-600" />
                <span>AES-256 Secured</span>
              </span>
            </div>
          </div>

          {/* Navigation Links Columns (8 cols) */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            {/* Column 1: Product (Includes All Navbar Routes) */}
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
                  <Link href="/faq" className="hover:text-foreground transition-colors">
                    {t("navFaq")}
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-foreground transition-colors">
                    {t("navLogin")}
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="font-medium text-primary hover:underline">
                    {t("startFree")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Solutions / Features */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {t("footerSolutions")}
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                <li>
                  <Link href="/features#inbox" className="hover:text-foreground transition-colors">
                    {t("features.inbox.title")}
                  </Link>
                </li>
                <li>
                  <Link href="/features#orders" className="hover:text-foreground transition-colors">
                    {t("features.orders.title")}
                  </Link>
                </li>
                <li>
                  <Link href="/features#courier" className="hover:text-foreground transition-colors">
                    {t("features.courier.title")}
                  </Link>
                </li>
                <li>
                  <Link href="/features#risk" className="hover:text-foreground transition-colors">
                    {t("features.risk.title")}
                  </Link>
                </li>
                <li>
                  <Link href="/features#ledger" className="hover:text-foreground transition-colors">
                    {t("features.ledger.title")}
                  </Link>
                </li>
                <li>
                  <Link href="/features#comments" className="hover:text-foreground transition-colors">
                    {t("features.comments.title")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Resources & Support */}
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
                    Workflow Guide
                  </Link>
                </li>
                <li>
                  <Link href="/data-deletion" className="hover:text-foreground transition-colors">
                    {t("footerDeletion")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Legal & Compliance */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {t("footerLegal")}
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors">
                    {t("footerTerms")}
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition-colors">
                    {t("footerPrivacy")}
                  </Link>
                </li>
                <li>
                  <Link href="/data-deletion" className="hover:text-foreground transition-colors">
                    {t("footerDeletion")}
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition-colors">
                    Security & Data
                  </Link>
                </li>
              </ul>
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
            <span>Cloud Infrastructure</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
