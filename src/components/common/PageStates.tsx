"use client";
import { RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  const t = useTranslations("common");
  return (
    <div className="grid min-h-40 place-items-center rounded-xl border border-danger/30 bg-danger-soft p-6 text-center">
      <div>
        <p className="font-semibold">{t("errorTitle")}</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg border bg-card px-4 text-sm"
          >
            <RefreshCw size={16} />
            {t("retry")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
export function EmptyState({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-40 place-items-center rounded-xl border border-dashed p-6 text-center">
      <div>
        <p className="font-medium">{title}</p>
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
    </div>
  );
}
