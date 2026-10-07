"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { DigitsOnlyInput } from "@/components/common/DigitsOnlyInput";
import { takaToPaisa } from "@/lib/money";
import type { CourierConnectionDTO } from "@/types/courier";
import type { MoneyAccountDTO } from "@/types/hisab";
import type { PayoutLineInput } from "@/types/reconciliation";

type DraftLine = {
  consignmentId: string;
  codCollected: string;
  courierCharge: string;
  codCharge: string;
};

const blankLine = (): DraftLine => ({
  consignmentId: "",
  codCollected: "",
  courierCharge: "",
  codCharge: "",
});
const validTaka = (value: string) => /^\d+$/.test(value);

export interface PayoutMetadata {
  courierConnectionId: string;
  payoutDate: string;
  receivedTaka: string;
  moneyAccountId: string;
  reference: string;
  note: string;
}

export function PayoutMetadataFields({
  metadata,
  connections,
  accounts,
  onChange,
}: {
  metadata: PayoutMetadata;
  connections: CourierConnectionDTO[];
  accounts: MoneyAccountDTO[];
  onChange: (metadata: PayoutMetadata) => void;
}) {
  const t = useTranslations("reconciliation");
  const update = (field: keyof PayoutMetadata, value: string) =>
    onChange({ ...metadata, [field]: value });
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <Field label={t("courier")}>
        <select
          value={metadata.courierConnectionId}
          onChange={(event) =>
            update("courierConnectionId", event.target.value)
          }
          className={inputClass}
          required
        >
          <option value="">{t("courier")}</option>
          {connections.map((connection) => (
            <option key={connection.id} value={connection.id}>
              {connection.name} · {connection.provider}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t("destination")}>
        <select
          value={metadata.moneyAccountId}
          onChange={(event) => update("moneyAccountId", event.target.value)}
          className={inputClass}
          required
        >
          <option value="">{t("destination")}</option>
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
      </Field>
      <Field label={t("payoutDate")}>
        <input
          type="date"
          value={metadata.payoutDate}
          onChange={(event) => update("payoutDate", event.target.value)}
          className={inputClass}
          required
        />
      </Field>
      <Field label={t("receivedAmount")}>
        <DigitsOnlyInput
          value={metadata.receivedTaka}
          onChange={(event) =>
            update("receivedTaka", event.currentTarget.value)
          }
          className={inputClass}
          required
        />
      </Field>
      <Field label={t("reference")}>
        <input
          value={metadata.reference}
          onChange={(event) => update("reference", event.target.value)}
          className={inputClass}
          maxLength={255}
        />
      </Field>
      <Field label={t("note")}>
        <input
          value={metadata.note}
          onChange={(event) => update("note", event.target.value)}
          className={inputClass}
          maxLength={2000}
        />
      </Field>
    </div>
  );
}

export function PayoutForm({
  busy,
  onSubmit,
}: {
  busy: boolean;
  onSubmit: (items: PayoutLineInput[]) => void;
}) {
  const t = useTranslations("reconciliation");
  const [lines, setLines] = useState<DraftLine[]>([blankLine()]);
  const [error, setError] = useState<string | null>(null);

  const update = (index: number, key: keyof DraftLine, value: string) => {
    setLines((current) =>
      current.map((line, lineIndex) =>
        lineIndex === index ? { ...line, [key]: value } : line,
      ),
    );
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const complete = lines.filter((line) => line.consignmentId.trim());
    if (complete.length === 0) {
      setError(t("emptyConsignment"));
      return;
    }
    if (
      complete.some(
        (line) =>
          !validTaka(line.codCollected) ||
          (line.courierCharge && !validTaka(line.courierCharge)) ||
          (line.codCharge && !validTaka(line.codCharge)),
      )
    ) {
      setError(t("invalidAmount"));
      return;
    }
    setError(null);
    onSubmit(
      complete.map((line) => ({
        consignmentId: line.consignmentId.trim(),
        codCollectedPaisa: takaToPaisa(line.codCollected),
        courierChargePaisa: line.courierCharge
          ? takaToPaisa(line.courierCharge)
          : 0,
        codChargePaisa: line.codCharge ? takaToPaisa(line.codCharge) : 0,
      })),
    );
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-3">
        {lines.map((line, index) => (
          <div
            key={index}
            className="grid gap-3 border-b pb-3 sm:grid-cols-2 xl:grid-cols-[minmax(170px,1.4fr)_repeat(3,minmax(120px,1fr))_40px]"
          >
            <Field label={t("consignment")}>
              <input
                value={line.consignmentId}
                onChange={(event) =>
                  update(index, "consignmentId", event.target.value)
                }
                className={inputClass}
                maxLength={255}
              />
            </Field>
            <AmountField
              label={t("codCollected")}
              value={line.codCollected}
              onChange={(value) => update(index, "codCollected", value)}
            />
            <AmountField
              label={t("deliveryCharge")}
              value={line.courierCharge}
              onChange={(value) => update(index, "courierCharge", value)}
            />
            <AmountField
              label={t("codCharge")}
              value={line.codCharge}
              onChange={(value) => update(index, "codCharge", value)}
            />
            <button
              type="button"
              onClick={() =>
                setLines((current) =>
                  current.filter((_, lineIndex) => lineIndex !== index),
                )
              }
              disabled={lines.length === 1}
              className="mt-5 grid size-10 place-items-center border text-muted-foreground hover:bg-muted disabled:opacity-40"
              aria-label={t("removeParcel")}
              title={t("removeParcel")}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap justify-between gap-2">
        <button
          type="button"
          onClick={() => setLines((current) => [...current, blankLine()])}
          className="inline-flex min-h-10 items-center gap-2 border px-3 text-sm hover:bg-muted"
        >
          <Plus size={16} />
          {t("addParcel")}
        </button>
        <button
          type="submit"
          disabled={busy}
          className="min-h-10 bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {t("savePayout")}
        </button>
      </div>
    </form>
  );
}

function AmountField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <DigitsOnlyInput
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        className={inputClass}
      />
    </Field>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-0 space-y-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "h-10 w-full min-w-0 rounded-md border bg-background px-3 text-sm outline-none focus:border-primary";
