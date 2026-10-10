"use client";

import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

export function CredentialSecurityNotice({
  provider,
}: {
  provider: "meta" | "courier";
}) {
  const t = useTranslations("credentialSecurity");
  return (
    <aside
      aria-label={t("title")}
      className="flex items-start gap-3 border-l-2 border-emerald-600 py-2 pl-3 text-sm"
    >
      <ShieldCheck
        size={18}
        aria-hidden="true"
        className="mt-0.5 shrink-0 text-emerald-700"
      />
      <div className="min-w-0 space-y-1">
        <p className="font-semibold">{t("title")}</p>
        <p className="text-muted-foreground">{t(provider)}</p>
        <p className="text-xs text-muted-foreground">{t("serverAccess")}</p>
      </div>
    </aside>
  );
}
