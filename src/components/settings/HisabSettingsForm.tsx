"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { TextField } from "@/components/common/Field";
import { PageHeader } from "@/components/common/PageHeader";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { useQuery } from "@tanstack/react-query";
import { shopsApi } from "@/lib/api/shops.api";
export default function HisabSettingsForm() {
  const t = useTranslations("hisab"); const { shopId } = useCurrentShop(); const query = useQuery({ queryKey: ["settings", shopId], queryFn: () => shopsApi.settings(shopId!), enabled: Boolean(shopId) }); const [value, setValue] = useState<string>();
  if (query.isPending || !query.data) return null;
  const current = value ?? query.data.tagadaTemplate ?? "";
  return <div className="space-y-6"><PageHeader title={t("settingsTitle")} description={t("settingsDescription")} /><form onSubmit={async e => { e.preventDefault(); try { await shopsApi.updateSettings(shopId!, { tagadaTemplate: current || null }); toast.success(t("saved")); await query.refetch(); } catch { toast.error(t("saveError")); } }} className="max-w-2xl space-y-4 rounded-2xl border bg-card p-5"><TextField label={t("tagadaTemplate")} value={current} onChange={e => setValue(e.target.value)} placeholder={t("tagadaPlaceholder")} /><p className="text-sm text-muted-foreground">{t("tagadaVariables")}</p><div className="rounded-lg bg-muted p-3 text-sm">{current.replace("{name}", "Rahim").replace("{amount}", "600").replace("{shopName}", "Bikrio").replace("{footer}", "")}</div><button className="min-h-11 rounded-lg bg-primary px-4 font-semibold text-primary-foreground">{t("save")}</button></form></div>;
}
