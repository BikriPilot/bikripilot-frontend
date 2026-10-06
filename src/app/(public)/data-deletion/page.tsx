import { getTranslations } from "next-intl/server";
import { publicServerApi } from "@/lib/api/public.api";
export default async function DataDeletionPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const [t, params] = await Promise.all([
    getTranslations("legal"),
    searchParams,
  ]);
  const status = params.code
    ? await publicServerApi.getDataDeletionStatus(params.code)
    : null;
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <h1 className="text-4xl font-semibold">{t("deletion.title")}</h1>
      <p className="mt-4 leading-7 text-muted-foreground">
        {t("deletion.intro")}
      </p>
      <div className="mt-8 rounded-xl border bg-card p-6">
        <h2 className="font-semibold">{t("deletion.howTitle")}</h2>
        <p className="mt-2 leading-7 text-muted-foreground">
          {t("deletion.howBody")}
        </p>
        {params.code ? (
          <div className="mt-5 rounded-lg bg-muted p-4 text-sm">
            {status
              ? `${t("deletion.status")}: ${status.status}`
              : t("deletion.statusUnavailable")}
          </div>
        ) : null}
      </div>
    </main>
  );
}
