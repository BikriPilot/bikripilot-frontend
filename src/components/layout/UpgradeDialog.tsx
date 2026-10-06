"use client";
import Link from "next/link";
import { X } from "lucide-react";
import { useUiStore } from "@/stores/uiStore";
import { useTranslations } from "next-intl";
export function UpgradeDialog() {
  const upgrade = useUiStore((state) => state.upgrade);
  const close = useUiStore((state) => state.closeUpgrade);
  const t = useTranslations("step8");
  if (!upgrade) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-semibold">{t("upgradeTitle")}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("upgradeBody")}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="grid size-10 place-items-center rounded-lg hover:bg-muted"
            aria-label={t("close")}
          >
            <X size={18} />
          </button>
        </div>
        <Link
          href="/dashboard/billing"
          onClick={close}
          className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          {t("seePlans")}
        </Link>
      </div>
    </div>
  );
}
