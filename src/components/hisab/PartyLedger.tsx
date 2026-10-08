"use client";
import { useState } from "react";
import { FileText, Pencil, Trash2, Phone, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { hisabApi } from "@/lib/api/hisab.api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { HisabDialog } from "./PartyForm";
import { toLatinDigits, normalizeBdPhone } from "@/lib/phone";
import type { LedgerEntryDTO, PartyDTO, MoneyAccountDTO } from "@/types/hisab";
import { formatMoney } from "@/lib/money";
import { EntrySheet } from "./EntrySheet";
export function PartyLedger({
  party,
  entries,
  accounts,
  onEntry,
  busy,
  t,
  onEditParty,
  onArchive,
  onRemind,
  onLoadMore,
  hasMore,
}: {
  party: PartyDTO;
  entries: LedgerEntryDTO[];
  accounts: MoneyAccountDTO[];
  onEntry: (body: Record<string, unknown>) => Promise<void>;
  busy: boolean;
  t: (key: string) => string;
  onEditParty?: () => void;
  onArchive?: () => void;
  onRemind?: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}) {
  const [direction, setDirection] = useState<"GAVE" | "GOT" | null>(null);
  const { shopId, can, shop } = useCurrentShop();
  const client = useQueryClient();
  const [editing, setEditing] = useState<LedgerEntryDTO>();
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const refresh = () =>
    client.invalidateQueries({ queryKey: ["hisab", shopId] });
  const remove = async (entry: LedgerEntryDTO) => {
    if (!window.confirm(t("confirmDelete"))) return;
    try {
      await hisabApi.deleteEntry(shopId!, entry.id);
      await refresh();
    } catch {
      toast.error(t("saveError"));
    }
  };
  const source = (entry: LedgerEntryDTO) =>
    entry.isAuto &&
    entry.sourceId &&
    ["ORDER", "ORDER_PAYMENT", "DELIVERY", "RETURN"].includes(entry.source) ? (
      <Link
        href={`/dashboard/orders/${entry.sourceId}`}
        className="text-primary"
      >
        {entry.sourceLabel ?? t("automatic")}
      </Link>
    ) : (
      (entry.sourceLabel ?? entry.note ?? t("emptyNote"))
    );
  const controls = (entry: LedgerEntryDTO) =>
    can("hisab.write") && !entry.isAuto ? (
      <div className="flex">
        <button
          aria-label={t("editEntry")}
          title={t("editEntry")}
          onClick={() => {
            setEditing(entry);
            setFailed(false);
          }}
          className="grid size-11 place-items-center"
        >
          <Pencil className="size-4" />
        </button>
        <button
          aria-label={t("deleteEntry")}
          title={t("deleteEntry")}
          onClick={() => void remove(entry)}
          className="grid size-11 place-items-center"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    ) : null;
  return (
    <section className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{party.name}</h2>
          <p className="text-sm text-muted-foreground">
            {party.phone || t("noPhone")}
          </p>
          <p
            className={`mt-2 text-2xl font-bold ${party.balancePaisa > 0 ? "text-success" : party.balancePaisa < 0 ? "text-danger" : ""}`}
          >
            {formatMoney(Math.abs(party.balancePaisa))}{" "}
            <span className="text-sm font-normal">
              {party.balancePaisa > 0
                ? t("youllGet")
                : party.balancePaisa < 0
                  ? t("youllGive")
                  : t("settled")}
            </span>
          </p>
        </div>
        <Link
          href={`/dashboard/hisab/statement/${party.id}`}
          className="flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm"
        >
          <FileText className="size-4" />
          {t("statement")}
        </Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {party.phone && (
          <a
            href={`tel:${party.phone}`}
            title={t("call")}
            aria-label={t("call")}
            className="grid size-11 place-items-center rounded border"
          >
            <Phone className="size-4" />
          </a>
        )}
        {can("hisab.write") && (
          <>
            <button
              onClick={onEditParty}
              className="min-h-11 rounded border px-3"
            >
              {t("editParty")}
            </button>
            <button
              onClick={onArchive}
              className="min-h-11 rounded border px-3"
            >
              {t("archive")}
            </button>
            {party.balancePaisa > 0 && party.phone && !party.reminderOptOut && (
              <button
                onClick={onRemind}
                className="flex min-h-11 items-center gap-2 rounded border px-3"
              >
                <MessageCircle className="size-4" />
                {t("reminder")}
              </button>
            )}
          </>
        )}
      </div>
      {can("hisab.write") && (
        <div className="sticky bottom-16 z-10 my-4 grid grid-cols-2 gap-2 bg-background py-2 md:static">
          <button
            onClick={() => setDirection("GAVE")}
            className="min-h-12 rounded-lg bg-danger/10 font-semibold text-danger"
          >
            {t("gave")}
          </button>
          <button
            onClick={() => setDirection("GOT")}
            className="min-h-12 rounded-lg bg-success/10 font-semibold text-success"
          >
            {t("got")}
          </button>
        </div>
      )}
      <div className="space-y-3 md:hidden">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-lg border p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  {entry.entryDate}
                </p>
                <p className="break-words">{source(entry)}</p>
              </div>
              {controls(entry)}
            </div>
            <div className="mt-2 flex flex-wrap justify-between gap-2 text-sm">
              <span
                className={
                  entry.direction === "GAVE" ? "text-danger" : "text-success"
                }
              >
                {entry.direction === "GAVE" ? t("gave") : t("got")}:{" "}
                {formatMoney(entry.amountPaisa)}
              </span>
              <span>
                {formatMoney(Math.abs(entry.runningBalancePaisa))}{" "}
                {entry.runningBalancePaisa > 0
                  ? t("youllGet")
                  : entry.runningBalancePaisa < 0
                    ? t("youllGive")
                    : t("settled")}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th className="p-2">{t("date")}</th>
              <th className="p-2">{t("note")}</th>
              <th className="p-2">{t("gave")}</th>
              <th className="p-2">{t("got")}</th>
              <th className="p-2">{t("balance")}</th>
              <th className="p-2">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-b last:border-0">
                <td className="p-2">{e.entryDate}</td>
                <td className="p-2">{source(e)}</td>
                <td className="p-2 text-danger">
                  {e.direction === "GAVE" ? formatMoney(e.amountPaisa) : "—"}
                </td>
                <td className="p-2 text-success">
                  {e.direction === "GOT" ? formatMoney(e.amountPaisa) : "—"}
                </td>
                <td className="p-2 font-medium">
                  {formatMoney(Math.abs(e.runningBalancePaisa))}
                  <span className="block text-xs">
                    {e.runningBalancePaisa > 0
                      ? t("youllGet")
                      : e.runningBalancePaisa < 0
                        ? t("youllGive")
                        : t("settled")}
                  </span>
                </td>
                <td>{controls(e)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {entries.length === 0 ? (
          <p className="p-5 text-center text-sm text-muted-foreground">
            {t("emptyEntries")}
          </p>
        ) : null}
      </div>
      {entries.length === 0 && (
        <p className="text-sm text-muted-foreground md:hidden">
          {t("emptyEntries")}
        </p>
      )}
      {hasMore && (
        <button onClick={onLoadMore} className="min-h-11 w-full rounded border">
          {t("loadMore")}
        </button>
      )}
      {direction ? (
        <EntrySheet
          direction={direction}
          accounts={accounts}
          busy={busy}
          onClose={() => setDirection(null)}
          onSave={(body, sendMessage) => {
            const phone = normalizeBdPhone(party.phone ?? "");
            const popup =
              sendMessage && phone
                ? window.open("about:blank", "_blank")
                : null;
            if (popup) popup.opener = null;
            void onEntry(body)
              .then(() => {
                if (popup && phone) {
                  const balance =
                    party.balancePaisa +
                    (direction === "GAVE" ? 1 : -1) * Number(body.amountPaisa);
                  const message = `আজ ৳${Number(body.amountPaisa) / 100} ${direction === "GOT" ? "জমা" : "বাকি"} হয়েছে। মোট বাকি ৳${balance / 100}। - ${shop?.shopName ?? ""}`;
                  popup.location.href = `https://wa.me/88${phone}?text=${encodeURIComponent(message)}`;
                }
                setDirection(null);
              })
              .catch(() => {
                popup?.close();
              });
          }}
          t={t}
        />
      ) : null}
      {editing && (
        <HisabDialog
          title={t("editEntry")}
          onClose={() => setEditing(undefined)}
          busy={saving}
        >
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              setSaving(true);
              setFailed(false);
              try {
                await hisabApi.updateEntry(shopId!, editing.id, {
                  amountPaisa: Math.round(Number(form.get("amount")) * 100),
                  entryDate: String(form.get("date")),
                  note: String(form.get("note") ?? "") || null,
                  moneyAccountId: String(form.get("account") ?? "") || null,
                });
                await refresh();
                setEditing(undefined);
              } catch {
                setFailed(true);
              } finally {
                setSaving(false);
              }
            }}
          >
            <label className="block">
              {t("amount")}
              <input
                name="amount"
                defaultValue={editing.amountPaisa / 100}
                required
                inputMode="decimal"
                onInput={(event) => {
                  event.currentTarget.value = toLatinDigits(
                    event.currentTarget.value,
                  ).replace(/[^0-9.]/g, "");
                }}
                className="mt-1 h-11 w-full rounded border bg-card px-3"
              />
            </label>
            <label className="block">
              {t("date")}
              <input
                type="date"
                name="date"
                required
                defaultValue={editing.entryDate}
                className="mt-1 h-11 w-full rounded border bg-card px-3"
              />
            </label>
            <label className="block">
              {t("note")}
              <textarea
                name="note"
                defaultValue={editing.note ?? ""}
                maxLength={2000}
                className="mt-1 min-h-20 w-full rounded border bg-card p-3"
              />
            </label>
            <label className="block">
              {t("account")}
              <select
                name="account"
                defaultValue={editing.moneyAccount?.id ?? ""}
                className="mt-1 h-11 w-full rounded border bg-card px-3"
              >
                <option value="">{t("noCashMoved")}</option>
                {accounts
                  .filter((account) => account.kind !== "COURIER")
                  .map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
              </select>
            </label>
            {failed && (
              <p role="alert" className="text-danger">
                {t("saveError")}
              </p>
            )}
            <button
              disabled={saving}
              className="min-h-11 w-full rounded bg-primary text-primary-foreground"
            >
              {saving ? t("saving") : t("save")}
            </button>
          </form>
        </HisabDialog>
      )}
    </section>
  );
}
