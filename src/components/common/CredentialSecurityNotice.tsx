"use client";

import { ShieldCheck, Lock } from "lucide-react";
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
      className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 sm:p-5 shadow-xs"
    >
      <div className="flex items-start gap-3.5">
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
          <ShieldCheck size={20} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <span>{t("title")}</span>
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
              <Lock size={10} />
              <span>AES-256-GCM Encrypted</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t(provider)}
          </p>
          <div className="border-t border-emerald-500/10 pt-2">
            <p className="text-[11px] text-muted-foreground/90 leading-relaxed">
              {t("serverAccess")}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

