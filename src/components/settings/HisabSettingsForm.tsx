"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { TextField } from "@/components/common/Field";
import { PageHeader } from "@/components/common/PageHeader";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ErrorState } from "@/components/common/PageStates";
import { HisabSkeleton } from "@/components/common/skeletons";
import { shopsApi } from "@/lib/api/shops.api";
export default function HisabSettingsForm() {
  const t = useTranslations("hisab");
  const { shopId, can, shop } = useCurrentShop();
  const client = useQueryClient();
  const [busy, setBusy] = useState(false);
  const query = useQuery({
    queryKey: ["settings", shopId],
    queryFn: () => shopsApi.settings(shopId!),
    enabled: Boolean(shopId),
  });
  const [value, setValue] = useState<string>();
  if (query.isPending) return <HisabSkeleton />;
  if (query.isError || !query.data)
    return <ErrorState onRetry={() => void query.refetch()} />;
  const current = value ?? query.data.tagadaTemplate ?? "";
  return (
    <div className="space-y-6">
      <PageHeader
        title={t("settingsTitle")}
        description={t("settingsDescription")}
      />
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy || !can("shop.manage")) return;
          setBusy(true);
          try {
            await shopsApi.updateSettings(shopId!, {
              tagadaTemplate: current || null,
            });
            toast.success(t("saved"));
            await query.refetch();
            await client.invalidateQueries({ queryKey: ["settings", shopId] });
          } catch {
            toast.error(t("saveError"));
          } finally {
            setBusy(false);
          }
        }}
        className="max-w-2xl space-y-4"
      >
        <TextField
          label={t("tagadaTemplate")}
          value={current}
          disabled={busy || !can("shop.manage")}
          maxLength={2000}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t("tagadaPlaceholder")}
        />
        <p className="text-sm text-muted-foreground">{t("tagadaVariables")}</p>
        <div className="rounded-lg bg-muted p-3 text-sm">
          {current
            .replace(/\{name\}/g, "Rahim")
            .replace(/\{amount\}/g, "600")
            .replace(/\{shopName\}/g, shop?.shopName ?? "")
            .replace(/\{shopPhone\}/g, "01700000000")
            .replace(/\{footer\}/g, "")}
        </div>
        <button
          disabled={busy || !can("shop.manage")}
          className="min-h-11 rounded-lg bg-primary px-4 font-semibold text-primary-foreground"
        >
          {busy ? t("saving") : t("save")}
        </button>
      </form>
    </div>
  );
}
