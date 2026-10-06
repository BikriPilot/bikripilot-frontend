import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { PublicConfig } from "@/types/publicConfig";

export async function PublicFooter({
  config,
}: {
  config: PublicConfig | null;
}) {
  const t = await getTranslations("landing");
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-lg font-semibold">Bikrio</p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            {t("footerAbout")}
          </p>
          {config?.supportEmail ? (
            <a
              className="mt-4 inline-block text-sm text-primary"
              href={`mailto:${config.supportEmail}`}
            >
              {config.supportEmail}
            </a>
          ) : null}
        </div>
        <div className="grid content-start gap-3 text-sm text-muted-foreground">
          <Link href="/pricing" className="hover:text-foreground">
            {t("navPricing")}
          </Link>
          <Link href="/contact" className="hover:text-foreground">
            {t("footerContact")}
          </Link>
          <Link href="/data-deletion" className="hover:text-foreground">
            {t("footerDeletion")}
          </Link>
        </div>
        <div className="grid content-start gap-3 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground">
            {t("footerPrivacy")}
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            {t("footerTerms")}
          </Link>
          {config?.supportPhone ? (
            <a
              href={`tel:${config.supportPhone}`}
              className="hover:text-foreground"
            >
              {config.supportPhone}
            </a>
          ) : null}
          {config?.facebookPageUrl ? (
            <a
              href={config.facebookPageUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              {t("footerFacebook")}
            </a>
          ) : null}
        </div>
      </div>
      <div className="border-t px-5 py-5 text-center text-xs text-muted-foreground">
        {t("copyright", { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}
