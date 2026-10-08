"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Eye, X } from "lucide-react";
import { exitImpersonation, getImpersonationShopName } from "@/lib/api/client";
import { useAuthStore } from "@/stores/authStore";

export function ImpersonationBanner() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const t = useTranslations("admin.impersonation");
  const impersonation = user?.impersonation;
  if (!impersonation) return null;

  const exit = () => {
    exitImpersonation();
    router.replace("/admin");
  };

  return (
    <div className="sticky top-0 z-[60] flex min-h-12 items-center justify-between gap-3 bg-danger px-4 py-2 text-sm text-white shadow-sm">
      <p className="flex min-w-0 items-center gap-2">
        <Eye size={17} className="shrink-0" />
        <span className="truncate">
          {t("viewing", {
            shop: getImpersonationShopName() ?? impersonation.shopId,
          })}
        </span>
        <span className="hidden shrink-0 font-semibold sm:inline">
          {t("readOnly")}
        </span>
      </p>
      <button
        type="button"
        onClick={exit}
        className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-sm border border-white/40 px-3 font-semibold hover:bg-white/10"
        aria-label={t("exit")}
      >
        <span className="hidden sm:inline">{t("exit")}</span>
        <X size={16} />
      </button>
    </div>
  );
}
