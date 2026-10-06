"use client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
export function TrackingForm() {
  const t = useTranslations("tracking"); const router = useRouter();
  const submit = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const data = new FormData(event.currentTarget); const shop = String(data.get("shopSlug")); const order = String(data.get("orderNumber")); const phone = String(data.get("phoneLast4")); router.push(`/track/${encodeURIComponent(shop)}/${encodeURIComponent(order)}?phoneLast4=${encodeURIComponent(phone)}`); };
  return <form onSubmit={submit} className="mx-auto max-w-md space-y-4 rounded-2xl border bg-card p-5"><h1 className="text-2xl font-semibold">{t("title")}</h1><p className="text-sm text-muted-foreground">{t("description")}</p>{[["shopSlug","shopSlug"],["orderNumber","orderNumber"],["phoneLast4","phoneLast4"]].map(([name, label]) => <label key={name} className="block space-y-2"><span>{t(label)}</span><input name={name} required maxLength={name === "phoneLast4" ? 4 : undefined} inputMode={name === "phoneLast4" ? "numeric" : "text"} className="h-11 w-full rounded-lg border bg-background px-3" /></label>)}<button className="min-h-11 w-full rounded-lg bg-primary font-semibold text-primary-foreground">{t("find")}</button></form>;
}
