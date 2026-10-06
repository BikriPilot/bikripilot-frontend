import { getTranslations } from "next-intl/server";
import { publicServerApi } from "@/lib/api/public.api";
export default async function ContactPage() {
  const [t, config] = await Promise.all([
    getTranslations("help"),
    publicServerApi.getConfig(),
  ]);
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <h1 className="text-4xl font-semibold">{t("contactTitle")}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{t("contactBody")}</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {config?.supportPhone ? (
          <a
            href={`tel:${config.supportPhone}`}
            className="rounded-xl border bg-card p-5"
          >
            <p className="text-sm text-muted-foreground">{t("phone")}</p>
            <p className="mt-2 font-semibold">{config.supportPhone}</p>
          </a>
        ) : null}
        {config?.supportEmail ? (
          <a
            href={`mailto:${config.supportEmail}`}
            className="rounded-xl border bg-card p-5"
          >
            <p className="text-sm text-muted-foreground">{t("email")}</p>
            <p className="mt-2 font-semibold">{config.supportEmail}</p>
          </a>
        ) : null}
        {config?.supportWhatsapp ? (
          <a
            href={`https://wa.me/${config.supportWhatsapp.replace(/\D/g, "")}`}
            className="rounded-xl border bg-card p-5"
          >
            <p className="text-sm text-muted-foreground">{t("whatsapp")}</p>
            <p className="mt-2 font-semibold">{config.supportWhatsapp}</p>
          </a>
        ) : null}
      </div>
    </main>
  );
}
