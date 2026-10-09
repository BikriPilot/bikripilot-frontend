"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";

export function CancelOrderDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}) {
  const t = useTranslations("orders.cancellation");
  const dialog = useRef<HTMLDialogElement>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    if (!open && dialog.current?.open) dialog.current?.close();
  }, [open]);
  return (
    <dialog
      ref={dialog}
      aria-labelledby="cancel-order-title"
      className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border bg-card p-5 text-foreground shadow-lg backdrop:bg-black/40"
      onCancel={(event) => {
        if (busy) event.preventDefault();
        else onClose();
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="cancel-order-title" className="font-semibold">
          {t("title")}
        </h2>
        <button
          type="button"
          aria-label={t("close")}
          title={t("close")}
          disabled={busy}
          className="grid size-11 place-items-center rounded-lg hover:bg-muted"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>
      <form
        className="mt-3 space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          if (busy || !reason.trim()) return;
          setBusy(true);
          setFailed(false);
          try {
            await onConfirm(reason.trim());
            setReason("");
            onClose();
          } catch {
            setFailed(true);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label className="grid gap-2 text-sm">
          {t("reason")}
          <textarea
            autoFocus
            required
            maxLength={500}
            value={reason}
            disabled={busy}
            onChange={(event) => setReason(event.target.value)}
            className="min-h-24 w-full rounded-lg border bg-background p-3 text-base"
          />
        </label>
        {failed && (
          <p role="alert" className="text-sm text-danger">
            {t("error")}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="min-h-11 rounded-lg border px-4"
          >
            {t("keep")}
          </button>
          <button
            disabled={busy || !reason.trim()}
            className="min-h-11 rounded-lg bg-danger px-4 text-white"
          >
            {busy ? t("saving") : t("submit")}
          </button>
        </div>
      </form>
    </dialog>
  );
}
