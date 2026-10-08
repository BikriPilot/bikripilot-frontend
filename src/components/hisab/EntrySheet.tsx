"use client";
import { useEffect, useRef, useState } from "react";
import { evaluate } from "mathjs";
import { X } from "lucide-react";
import { CalcKeypad } from "./CalcKeypad";
import { toLatinDigits } from "@/lib/phone";
import type { LedgerDirection, MoneyAccountDTO } from "@/types/hisab";
import { Field, TextField } from "@/components/common/Field";
import { uploadsApi } from "@/lib/api/uploads.api";
import { useCurrentShop } from "@/hooks/useCurrentShop";
export function calculateAmount(expression: string): number | null {
  if (
    !expression.trim() ||
    expression.length > 100 ||
    !/^[\d.()+*/\s-]+$/.test(expression)
  )
    return null;
  try {
    const result: unknown = evaluate(expression);
    return typeof result === "number" &&
      Number.isFinite(result) &&
      result > 0 &&
      result <= 10000000
      ? Math.round(result * 100)
      : null;
  } catch {
    return null;
  }
}
export const todayDhaka = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export function EntrySheet({
  direction,
  accounts,
  busy,
  onClose,
  onSave,
  t,
}: {
  direction: LedgerDirection;
  accounts: MoneyAccountDTO[];
  busy: boolean;
  onClose: () => void;
  onSave: (body: Record<string, unknown>, sendMessage?: boolean) => void;
  t: (key: string) => string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [accountId, setAccountId] = useState("");
  const [date, setDate] = useState(todayDhaka());
  const { shopId } = useCurrentShop();
  const [attachment, setAttachment] = useState<string>();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const [sendMessage, setSendMessage] = useState(false);
  const paisa = calculateAmount(amount);
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  return (
    <dialog
      ref={dialog}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      aria-label={direction === "GAVE" ? t("gave") : t("got")}
      className="m-auto max-h-[90dvh] w-[calc(100%-24px)] max-w-lg overflow-y-auto rounded-lg border bg-card p-5 text-foreground backdrop:bg-black/40"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (paisa !== null && !busy)
            onSave(
              {
                direction,
                amountPaisa: paisa,
                entryDate: date,
                note: note || undefined,
                moneyAccountId: accountId || undefined,
                clientRef: crypto.randomUUID(),
                attachmentUrl: attachment,
                method: accountId
                  ? accounts.find((account) => account.id === accountId)
                      ?.kind === "BANK"
                    ? "BANK"
                    : accounts.find((account) => account.id === accountId)
                          ?.name === "bKash"
                      ? "BKASH"
                      : accounts.find((account) => account.id === accountId)
                            ?.name === "Nagad"
                        ? "NAGAD"
                        : "CASH"
                  : "GOODS",
              },
              sendMessage,
            );
        }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {direction === "GAVE" ? t("gave") : t("got")}
          </h2>
          <button
            type="button"
            disabled={busy}
            aria-label={t("cancel")}
            title={t("cancel")}
            onClick={onClose}
            className="grid size-11 place-items-center"
          >
            <X className="size-5" />
          </button>
        </div>
        <Field
          label={t("amount")}
          value={amount}
          inputMode="decimal"
          onChange={(event) =>
            setAmount(
              toLatinDigits(event.target.value)
                .replace(/[^\d.()+*/\s-]/g, "")
                .slice(0, 100),
            )
          }
        />
        <CalcKeypad
          disabled={busy || uploading}
          onKey={(key) => {
            if (key === "=") {
              if (paisa !== null) setAmount(String(paisa / 100));
            } else setAmount((current) => `${current}${key}`.slice(0, 100));
          }}
          onBackspace={() => setAmount((current) => current.slice(0, -1))}
          backspaceLabel={t("backspace")}
        />
        <Field
          label={t("date")}
          type="date"
          required
          max={todayDhaka()}
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
        <label className="block">
          {t("cashMoved")}
          <select
            value={accountId}
            onChange={(event) => setAccountId(event.target.value)}
            className="mt-1 h-11 w-full rounded border bg-card px-3"
          >
            <option value="">{t("noCashMoved")}</option>
            {accounts
              .filter(
                (account) => !account.isArchived && account.kind !== "COURIER",
              )
              .map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
          </select>
        </label>
        <TextField
          label={t("note")}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
        <label className="block">
          {t("attachment")}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy || uploading}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file || !shopId) return;
              if (
                file.size > 5 * 1024 * 1024 ||
                !["image/jpeg", "image/png", "image/webp"].includes(file.type)
              ) {
                setUploadError(true);
                return;
              }
              setUploading(true);
              setUploadError(false);
              try {
                setAttachment(
                  (await uploadsApi.image(shopId, file, "hisab")).url,
                );
              } catch {
                setUploadError(true);
              } finally {
                setUploading(false);
              }
            }}
            className="mt-1 block w-full text-sm"
          />
        </label>
        {attachment && (
          <a
            href={attachment}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary"
          >
            {t("attachmentReady")}
          </a>
        )}
        {uploadError && (
          <p role="alert" className="text-danger">
            {t("uploadError")}
          </p>
        )}
        <label className="flex min-h-11 items-center gap-2">
          <input
            type="checkbox"
            checked={sendMessage}
            onChange={(event) => setSendMessage(event.target.checked)}
          />
          {t("sendTransaction")}
        </label>
        <button
          disabled={busy || uploading || paisa === null}
          className="min-h-11 w-full rounded bg-primary font-semibold text-primary-foreground"
        >
          {busy ? t("saving") : t("save")}
        </button>
      </form>
    </dialog>
  );
}
