import {
  ChevronDown,
  HelpCircle,
  Mail,
  MessageCircle,
  Phone,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { publicServerApi } from "@/lib/api/public.api";

export const metadata = {
  title: "Frequently Asked Questions — BikriPilot",
  description:
    "Find answers to common questions about BikriPilot, Facebook Page connection, official Meta API security, couriers, and pricing.",
};

const localized = (locale: string, bn: string | null, en: string | null) =>
  locale === "bn" ? bn || en || "" : en || bn || "";

export default async function FaqPage() {
  const [locale, t, config, dynamicFaq] = await Promise.all([
    getLocale(),
    getTranslations("landing"),
    publicServerApi.getConfig(),
    publicServerApi.getContent("FAQ"),
  ]);

  const defaultItems = [1, 2, 3, 4, 5, 6, 7, 8].map((index) => ({
    question: t(`faqItems.${index}.question`),
    answer: t(`faqItems.${index}.answer`),
  }));

  const allFaqs = dynamicFaq.length > 0 ? dynamicFaq : defaultItems;

  return (
    <main className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-primary-soft px-3.5 py-1 text-sm font-semibold text-primary">
          <HelpCircle className="size-4" />
          <span>{t("faqEyebrow")}</span>
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          {t("faqTitle")}
        </h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          {t("faqHeroDesc")}
        </p>
      </div>

      {/* Accordion List */}
      <div className="mt-12 divide-y rounded-2xl border bg-card shadow-sm">
        {allFaqs.map((item, idx) => {
          const q =
            "question" in item
              ? item.question
              : localized(locale, item.titleBn, item.titleEn);
          const a =
            "answer" in item
              ? item.answer
              : localized(locale, item.bodyBn, item.bodyEn);
          return (
            <details
              key={"id" in item ? item.id : idx}
              className="group p-6 transition-colors first:rounded-t-2xl last:rounded-b-2xl hover:bg-muted/30"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-semibold text-foreground sm:text-lg [&::-webkit-details-marker]:hidden">
                <span>{q}</span>
                <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180 group-open:text-primary" />
              </summary>
              <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
                {a}
              </p>
            </details>
          );
        })}
      </div>

      {/* Help / Contact Support Card */}
      <section className="mt-16 rounded-2xl border bg-muted/40 p-8 sm:p-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold">{t("haveQuestions")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Our support team is available to help you set up and answer any technical or business questions.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm"
            >
              <Mail className="size-4" />
              <span>{t("talkToSupport")}</span>
            </Link>
            {config?.supportWhatsapp ? (
              <a
                href={`https://wa.me/${config.supportWhatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border bg-card px-5 text-sm font-semibold hover:bg-muted"
              >
                <MessageCircle className="size-4 text-emerald-600" />
                <span>WhatsApp</span>
              </a>
            ) : null}
            {config?.supportPhone ? (
              <a
                href={`tel:${config.supportPhone}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border bg-card px-5 text-sm font-semibold hover:bg-muted"
              >
                <Phone className="size-4 text-primary" />
                <span>{config.supportPhone}</span>
              </a>
            ) : null}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mt-14 rounded-3xl border bg-primary p-8 text-primary-foreground sm:p-10">
        <div className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <div>
            <h2 className="text-2xl font-bold">{t("finalTitle")}</h2>
            <p className="mt-1 text-primary-foreground/80 text-sm">
              {t("finalBody")}
            </p>
          </div>
          <Link
            href="/register"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-card px-5 font-semibold text-foreground shadow-sm"
          >
            {t("startFree")}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
