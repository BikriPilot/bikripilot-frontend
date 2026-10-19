"use client";
import { RefreshCw, Wrench } from "lucide-react";
import { useTranslations } from "next-intl";

export function ErrorState({
  error,
  message,
  onRetry,
}: {
  error?: unknown;
  message?: string;
  onRetry?: () => void;
}) {
  const t = useTranslations("common");

  const errObj = error as { status?: number; code?: string; message?: string } | undefined;
  const isMaintenance =
    errObj?.code === "MAINTENANCE_MODE" ||
    errObj?.status === 503 ||
    (typeof message === "string" && message.toLowerCase().includes("maintenance"));

  const displayMessage =
    message ||
    errObj?.message ||
    (isMaintenance
      ? t("maintenanceMessage")
      : undefined);

  if (isMaintenance) {
    return (
      <div className="grid min-h-48 place-items-center rounded-xl border border-warning/40 bg-warning/10 p-8 text-center text-foreground shadow-sm">
        <div className="max-w-md space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warning/20 text-warning">
            <Wrench size={24} />
          </div>
          <h3 className="text-lg font-bold text-foreground">{t("maintenanceTitle")}</h3>
          {displayMessage ? (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{displayMessage}</p>
          ) : null}
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 inline-flex min-h-10 items-center gap-2 rounded-lg border bg-card px-4 text-sm font-medium hover:bg-accent transition-colors"
            >
              <RefreshCw size={15} />
              {t("retry")}
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-40 place-items-center rounded-xl border border-danger/30 bg-danger-soft p-6 text-center">
      <div>
        <p className="font-semibold">{t("errorTitle")}</p>
        {displayMessage ? (
          <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{displayMessage}</p>
        ) : null}
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
