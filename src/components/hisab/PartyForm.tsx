"use client";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { Field } from "@/components/common/Field";
import { toLatinDigits } from "@/lib/phone";
import { customersApi } from "@/lib/api/customers.api";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import type { PartyDTO } from "@/types/hisab";
import { todayDhaka } from "./EntrySheet";

export function HisabDialog({
  title,
  onClose,
  busy = false,
  children,
}: {
  title: string;
  onClose: () => void;
  busy?: boolean;
  children: React.ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const t = useTranslations("hisab");
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  return (
    <dialog
      ref={dialog}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      className="m-auto max-h-[90dvh] w-[calc(100%-24px)] max-w-lg overflow-y-auto rounded-lg border bg-card p-5 text-foreground backdrop:bg-black/40"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          aria-label={t("cancel")}
          title={t("cancel")}
          className="grid size-11 shrink-0 place-items-center"
        >
          <X className="size-5" />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function PartyForm({
  party,
  onClose,
  onSave,
  onCustomer,
}: {
  party?: PartyDTO;
  onClose: () => void;
  onSave: (body: Record<string, unknown>) => Promise<void>;
  onCustomer?: (id: string) => Promise<void>;
}) {
  const t = useTranslations("hisab");
  const { shopId, can } = useCurrentShop();
  const [name, setName] = useState(party?.name ?? "");
  const [kind, setKind] = useState(party?.kind ?? "CUSTOMER");
  const [phone, setPhone] = useState(party?.phone ?? "");
  const [address, setAddress] = useState(party?.address ?? "");
  const [opening, setOpening] = useState(
    String(Math.abs(party?.openingBalancePaisa ?? 0) / 100),
  );
  const [owe, setOwe] = useState((party?.openingBalancePaisa ?? 0) < 0);
  const [date, setDate] = useState(party?.openingDate ?? todayDhaka());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const customers = useQuery({
    queryKey: ["hisab-customers", shopId],
    queryFn: () => customersApi.list(shopId!, { page: 1, limit: 100 }),
    enabled: Boolean(!party && shopId && can("customer.read") && onCustomer),
  });
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const body = {
      name: name.trim(),
      phone: phone || (party ? null : undefined),
      address: address || (party ? null : undefined),
      openingBalancePaisa: Math.round(Number(opening) * 100) * (owe ? -1 : 1),
      openingDate: date,
      ...(!party ? { kind } : {}),
    };
    if (
      !z
        .object({
          name: z.string().min(1).max(255),
          openingBalancePaisa: z
            .number()
            .int()
            .min(-1000000000)
            .max(1000000000),
          openingDate: z.iso.date(),
        })
        .safeParse(body).success
    ) {
      setError(true);
      return;
    }
    setBusy(true);
    setError(false);
    try {
      await onSave(body);
      onClose();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };
  return (
    <HisabDialog
      title={party ? t("editParty") : t("addParty")}
      onClose={onClose}
      busy={busy}
    >
      <form onSubmit={save} className="space-y-4">
        <fieldset disabled={busy} className="space-y-4">
          {!party && (
            <label className="block">
              {t("kind")}
              <select
                value={kind}
                onChange={(event) => setKind(event.target.value as typeof kind)}
                className="mt-1 h-11 w-full rounded border bg-card px-3"
              >
                {["CUSTOMER", "SUPPLIER", "OTHER"].map((value) => (
                  <option key={value} value={value}>
                    {t(value.toLowerCase())}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="block">
            {t("name")}
            <input
              required
              maxLength={255}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 h-11 w-full rounded border bg-card px-3 text-base"
            />
          </label>
          <Field
            label={t("phone")}
            value={phone}
            inputMode="tel"
            onChange={(event) =>
              setPhone(
                toLatinDigits(event.target.value).replace(/[^0-9+]/g, ""),
              )
            }
          />
          <label className="block">
            {t("address")}
            <textarea
              value={address}
              maxLength={1000}
              onChange={(event) => setAddress(event.target.value)}
              className="mt-1 min-h-20 w-full rounded border bg-card p-3 text-base"
            />
          </label>
          <Field
            label={t("opening")}
            value={opening}
            inputMode="decimal"
            onChange={(event) => {
              const value = toLatinDigits(event.target.value).replace(
                /[^0-9.]/g,
                "",
              );
              if (/^\d*(\.\d{0,2})?$/.test(value)) setOpening(value);
            }}
          />
          <div className="flex flex-wrap gap-3">
            {[false, true].map((value) => (
              <label
                key={String(value)}
                className="flex min-h-11 items-center gap-2"
              >
                <input
                  type="radio"
                  checked={owe === value}
                  onChange={() => setOwe(value)}
                  name="openingSign"
                />
                {value ? t("youllGive") : t("youllGet")}
              </label>
            ))}
          </div>
          <label className="block">
            {t("date")}
            <input
              type="date"
              required
              max={todayDhaka()}
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="mt-1 h-11 w-full rounded border bg-card px-3 text-base"
            />
          </label>
          {error && (
            <p role="alert" className="text-danger">
              {t("saveError")}
            </p>
          )}
          <button className="min-h-11 w-full rounded bg-primary text-primary-foreground">
            {busy ? t("saving") : t("save")}
          </button>
          {!party && customers.data && onCustomer && (
            <label className="block border-t pt-4">
              {t("fromCustomer")}
              <select
                defaultValue=""
                onChange={async (event) => {
                  if (!event.target.value) return;
                  setBusy(true);
                  try {
                    await onCustomer(event.target.value);
                    onClose();
                  } catch {
                    setError(true);
                  } finally {
                    setBusy(false);
                  }
                }}
                className="mt-1 h-11 w-full rounded border bg-card px-3"
              >
                <option value="">{t("selectParty")}</option>
                {customers.data.data.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name ?? customer.phone}
                  </option>
                ))}
              </select>
            </label>
          )}
        </fieldset>
      </form>
    </HisabDialog>
  );
}
