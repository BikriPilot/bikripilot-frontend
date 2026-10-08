"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DigitsOnlyInput } from "@/components/common/DigitsOnlyInput";
import { formatMoney } from "@/lib/money";
import { isValidBdPhone } from "@/lib/phone";
import type {
  ManualInstructionsDTO,
  ManualPaymentInput,
} from "@/types/billing";
import { useLocale, useTranslations } from "next-intl";

const manualPaymentSchema = z
  .object({
    manualMethod: z.enum(["BKASH", "NAGAD"]),
    senderNumber: z.string().trim().refine(isValidBdPhone),
    transactionId: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .regex(/^[A-Za-z0-9-]+$/),
  })
  .strict();

interface ManualPaymentFormProps {
  instructions: ManualInstructionsDTO;
  isPending: boolean;
  onSubmit: (input: ManualPaymentInput) => void;
}

export function ManualPaymentForm({
  instructions,
  isPending,
  onSubmit,
}: ManualPaymentFormProps) {
  const t = useTranslations("billing");
  const locale = useLocale();
  const form = useForm<ManualPaymentInput>({
    resolver: zodResolver(manualPaymentSchema),
    defaultValues: {
      manualMethod: "BKASH",
      senderNumber: "",
      transactionId: "",
    },
  });

  return (
    <div className="mt-4 rounded-lg border bg-card p-4">
      <h3 className="font-semibold">{t("manual.title")}</h3>
      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">{t("manual.amount")}</dt>
          <dd className="font-semibold tabular-nums">
            {formatMoney(instructions.amountPaisa)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("manual.reference")}</dt>
          <dd className="break-all font-medium">{instructions.reference}</dd>
        </div>
        {instructions.bkashNumber ? (
          <div>
            <dt className="text-muted-foreground">bKash</dt>
            <dd className="font-medium">{instructions.bkashNumber}</dd>
          </div>
        ) : null}
        {instructions.nagadNumber ? (
          <div>
            <dt className="text-muted-foreground">Nagad</dt>
            <dd className="font-medium">{instructions.nagadNumber}</dd>
          </div>
        ) : null}
      </dl>
      {locale === "bn" ? (
        instructions.noteBn ? (
          <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
            {instructions.noteBn}
          </p>
        ) : null
      ) : instructions.noteEn ? (
        <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
          {instructions.noteEn}
        </p>
      ) : null}

      <form
        className="mt-4 grid gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium">{t("manual.method")}</legend>
          <div className="flex flex-wrap gap-2">
            {(["BKASH", "NAGAD"] as const).map((method) => (
              <label
                key={method}
                className="flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm"
              >
                <input
                  type="radio"
                  value={method}
                  {...form.register("manualMethod")}
                />
                {method === "BKASH" ? "bKash" : "Nagad"}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="grid gap-1.5 text-sm font-medium">
          <span>{t("manual.senderNumber")}</span>
          <DigitsOnlyInput
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            {...form.register("senderNumber")}
            className="h-11 rounded-lg border bg-background px-3 text-base outline-none focus:border-primary"
          />
          {form.formState.errors.senderNumber ? (
            <span className="text-xs text-danger">
              {t("manual.invalidPhone")}
            </span>
          ) : null}
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          <span>{t("manual.transactionId")}</span>
          <input
            {...form.register("transactionId")}
            maxLength={100}
            autoComplete="off"
            className="h-11 rounded-lg border bg-background px-3 text-base outline-none focus:border-primary"
          />
          {form.formState.errors.transactionId ? (
            <span className="text-xs text-danger">
              {t("manual.invalidTransactionId")}
            </span>
          ) : null}
        </label>
        <button
          type="submit"
          disabled={isPending}
          className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {isPending ? t("submitting") : t("manual.submit")}
        </button>
      </form>
    </div>
  );
}
