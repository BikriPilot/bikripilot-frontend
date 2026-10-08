"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { hisabApi } from "@/lib/api/hisab.api";
import { formatMoney } from "@/lib/money";
import { toLatinDigits } from "@/lib/phone";
import { MANUAL_CASH_CATEGORIES } from "@/constants/enums";
import type {
  CashEntryDTO,
  ExpenseCategoryDTO,
  MoneyAccountDTO,
} from "@/types/hisab";
import { HisabDialog } from "./PartyForm";
import { todayDhaka } from "./EntrySheet";
export function CashboxPanel({
  accounts,
  mini = false,
}: {
  accounts: MoneyAccountDTO[];
  mini?: boolean;
}) {
  const t = useTranslations("hisab");
  const locale = useLocale();
  const { shopId, can } = useCurrentShop();
  const client = useQueryClient();
  const [accountId, setAccountId] = useState("");
  const [category, setCategory] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [mode, setMode] = useState<
    "IN" | "OUT" | "EXPENSE" | "TRANSFER" | "ACCOUNT" | "CATEGORY" | null
  >(null);
  const [editing, setEditing] = useState<CashEntryDTO>();
  const [editingAccount, setEditingAccount] = useState<MoneyAccountDTO>();
  const [editingCategory, setEditingCategory] = useState<ExpenseCategoryDTO>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const entries = useQuery({
    queryKey: [
      "hisab",
      shopId,
      "cash",
      accountId,
      category,
      from,
      to,
      page,
      mini,
    ],
    queryFn: () =>
      hisabApi.cashEntries(shopId!, {
        accountId: accountId || undefined,
        category: category || undefined,
        from: from || undefined,
        to: to || undefined,
        page,
        limit: mini ? 10 : 20,
      }),
    enabled: Boolean(shopId),
  });
  const expenses = useQuery({
    queryKey: ["hisab", shopId, "expenses"],
    queryFn: () => hisabApi.expenses(shopId!),
    enabled: Boolean(shopId),
  });
  const refresh = () =>
    client.invalidateQueries({ queryKey: ["hisab", shopId] });
  const close = () => {
    setMode(null);
    setEditing(undefined);
    setEditingAccount(undefined);
    setEditingCategory(undefined);
    setError(false);
  };
  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (key: string) => String(form.get(key) ?? "").trim();
    const money = (key: string) => Math.round(Number(text(key)) * 100);
    setBusy(true);
    setError(false);
    try {
      if (mode === "ACCOUNT") {
        const body = {
          name: text("name"),
          openingBalancePaisa: money("opening"),
          ...(editingAccount
            ? {
                isArchived: form.get("archived") === "on",
                isDefault: form.get("default") === "on",
              }
            : { kind: text("kind") }),
        };
        if (editingAccount)
          await hisabApi.updateAccount(shopId!, editingAccount.id, body);
        else await hisabApi.createAccount(shopId!, body);
      } else if (mode === "CATEGORY") {
        const body = {
          nameEn: text("nameEn"),
          nameBn: text("nameBn"),
          ...(editingCategory
            ? { isArchived: form.get("archived") === "on" }
            : {}),
        };
        if (editingCategory)
          await hisabApi.updateExpense(shopId!, editingCategory.id, body);
        else await hisabApi.createExpense(shopId!, body);
      } else if (mode === "TRANSFER")
        await hisabApi.transfer(shopId!, {
          fromAccountId: text("account"),
          toAccountId: text("destination"),
          amountPaisa: money("amount"),
          entryDate: text("date"),
          note: text("note") || undefined,
        });
      else {
        const body = {
          amountPaisa: money("amount"),
          category: mode === "EXPENSE" ? "EXPENSE" : text("category"),
          expenseCategoryId: text("expense") || undefined,
          entryDate: text("date"),
          note: text("note") || undefined,
          ...(!editing
            ? {
                moneyAccountId: text("account"),
                direction: mode === "IN" ? "IN" : "OUT",
                clientRef: crypto.randomUUID(),
              }
            : {}),
        };
        if (editing) await hisabApi.updateCash(shopId!, editing.id, body);
        else await hisabApi.createCash(shopId!, body);
      }
      await refresh();
      close();
      toast.success(t("saved"));
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };
  const input = (
    name: string,
    label: string,
    value?: string | number,
    type = "text",
  ) => (
    <label className="block">
      {label}
      <input
        name={name}
        type={type}
        required={name !== "note"}
        defaultValue={value}
        min={type === "number" ? 0 : undefined}
        step={type === "number" ? "0.01" : undefined}
        max={type === "date" ? todayDhaka() : undefined}
        onInput={
          type === "number"
            ? (event) => {
                event.currentTarget.value = toLatinDigits(
                  event.currentTarget.value,
                );
              }
            : undefined
        }
        className="mt-1 h-11 w-full rounded border bg-card px-3 text-base"
      />
    </label>
  );
  const accountSelect = (name: string, label: string, selected?: string) => (
    <label className="block">
      {label}
      <select
        name={name}
        required
        defaultValue={
          selected ?? accounts.find((account) => account.isDefault)?.id
        }
        className="mt-1 h-11 w-full rounded border bg-card px-3"
      >
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
  );
  return (
    <section className="min-w-0 space-y-4">
      <h2 className="font-semibold">{t("cashbox")}</h2>
      <div
        className={
          mini ? "space-y-2" : "grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        }
      >
        {accounts.map((account) => (
          <div
            key={account.id}
            className="flex items-center justify-between gap-2 rounded-lg border p-3"
          >
            <div className="min-w-0">
              <p className="break-words text-sm">{account.name}</p>
              <p className="tabular-nums font-semibold">
                {formatMoney(account.balancePaisa)}
              </p>
            </div>
            {can("hisab.write") && account.kind !== "COURIER" && (
              <button
                aria-label={t("editAccount")}
                title={t("editAccount")}
                onClick={() => {
                  setEditingAccount(account);
                  setMode("ACCOUNT");
                }}
                className="grid size-11 shrink-0 place-items-center"
              >
                <Pencil className="size-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      {can("hisab.write") && (
        <div className="flex flex-wrap gap-2">
          {(
            ["IN", "OUT", "EXPENSE", "TRANSFER", "ACCOUNT", "CATEGORY"] as const
          ).map((value) => (
            <button
              key={value}
              onClick={() => setMode(value)}
              className="flex min-h-11 items-center gap-2 rounded border px-3 text-sm"
            >
              {value === "IN" ? (
                <ArrowDownLeft className="size-4" />
              ) : value === "TRANSFER" ? (
                <ArrowLeftRight className="size-4" />
              ) : value === "ACCOUNT" || value === "CATEGORY" ? (
                <Plus className="size-4" />
              ) : (
                <ArrowUpRight className="size-4" />
              )}
              {t(`cashActions.${value}`)}
            </button>
          ))}
        </div>
      )}
      {!mini && (
        <div className="grid gap-2 sm:grid-cols-4">
          <label>
            {t("account")}
            <select
              value={accountId}
              onChange={(event) => {
                setAccountId(event.target.value);
                setPage(1);
              }}
              className="h-11 w-full rounded border bg-card px-2"
            >
              <option value="">{t("all")}</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t("category")}
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setPage(1);
              }}
              className="h-11 w-full rounded border bg-card px-2"
            >
              <option value="">{t("all")}</option>
              {MANUAL_CASH_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {t(`cashCategories.${value}`)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t("from")}
            <input
              type="date"
              value={from}
              onChange={(event) => {
                setFrom(event.target.value);
                setPage(1);
              }}
              className="h-11 w-full rounded border bg-card px-2"
            />
          </label>
          <label>
            {t("to")}
            <input
              type="date"
              value={to}
              onChange={(event) => {
                setTo(event.target.value);
                setPage(1);
              }}
              className="h-11 w-full rounded border bg-card px-2"
            />
          </label>
        </div>
      )}
      {entries.isPending && <p aria-busy="true">{t("loading")}</p>}
      {entries.isError && (
        <button onClick={() => void entries.refetch()}>{t("retry")}</button>
      )}
      {entries.data?.data.length === 0 && (
        <p className="text-sm text-muted-foreground">{t("emptyEntries")}</p>
      )}
      {entries.data?.data.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center justify-between gap-2 border-b py-3 text-sm"
        >
          <div className="min-w-0">
            <p>
              {entry.moneyAccount.name} ·{" "}
              {t(`cashCategories.${entry.category}`)}
            </p>
            <p className="break-words text-muted-foreground">
              {entry.note ?? entry.sourceLabel} · {entry.entryDate}
            </p>
          </div>
          <span
            className={
              entry.direction === "IN"
                ? "whitespace-nowrap text-success"
                : "whitespace-nowrap text-danger"
            }
          >
            {entry.direction === "IN" ? "+" : "-"}
            {formatMoney(entry.amountPaisa)}
          </span>
          {can("hisab.write") && !entry.isAuto && (
            <div className="flex">
              <button
                title={t("editEntry")}
                aria-label={t("editEntry")}
                disabled={Boolean(entry.transferGroupId || entry.party)}
                onClick={() => {
                  setEditing(entry);
                  setMode(
                    entry.category === "EXPENSE" ? "EXPENSE" : entry.direction,
                  );
                }}
                className="grid size-11 place-items-center"
              >
                <Pencil className="size-4" />
              </button>
              <button
                title={t("deleteEntry")}
                aria-label={t("deleteEntry")}
                disabled={Boolean(entry.party)}
                onClick={async () => {
                  if (!window.confirm(t("confirmDelete"))) return;
                  try {
                    await hisabApi.deleteCash(shopId!, entry.id);
                    await refresh();
                  } catch {
                    toast.error(t("saveError"));
                  }
                }}
                className="grid size-11 place-items-center"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          )}
        </div>
      ))}
      {!mini && entries.data && (
        <div className="flex items-center justify-between">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="min-h-11 px-3"
          >
            {t("previous")}
          </button>
          <span>
            {page} / {Math.max(1, entries.data.meta.totalPages)}
          </span>
          <button
            disabled={page >= entries.data.meta.totalPages}
            onClick={() => setPage(page + 1)}
            className="min-h-11 px-3"
          >
            {t("next")}
          </button>
        </div>
      )}
      {!mini && (
        <div>
          <h3 className="font-semibold">{t("expenseCategories")}</h3>
          {expenses.data?.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between border-b py-2 text-sm"
            >
              <span>{locale === "bn" ? expense.nameBn : expense.nameEn}</span>
              {can("hisab.write") && (
                <button
                  aria-label={t("editCategory")}
                  title={t("editCategory")}
                  onClick={() => {
                    setEditingCategory(expense);
                    setMode("CATEGORY");
                  }}
                  className="grid size-11 place-items-center"
                >
                  <Pencil className="size-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {mode && (
        <HisabDialog
          title={t(`cashActions.${mode}`)}
          onClose={close}
          busy={busy}
        >
          <form onSubmit={save} className="space-y-4">
            <fieldset disabled={busy} className="space-y-4">
              {mode === "ACCOUNT" ? (
                <>
                  {input("name", t("name"), editingAccount?.name)}
                  {!editingAccount && (
                    <label>
                      {t("kind")}
                      <select
                        name="kind"
                        className="h-11 w-full rounded border bg-card px-3"
                      >
                        <option>CASH</option>
                        <option>MFS</option>
                        <option>BANK</option>
                      </select>
                    </label>
                  )}
                  {input(
                    "opening",
                    t("opening"),
                    (editingAccount?.openingBalancePaisa ?? 0) / 100,
                    "number",
                  )}
                  {editingAccount && (
                    <>
                      <label className="flex min-h-11 items-center gap-2">
                        <input
                          name="archived"
                          type="checkbox"
                          defaultChecked={editingAccount.isArchived}
                        />
                        {t("archive")}
                      </label>
                      {editingAccount.kind === "CASH" && (
                        <label className="flex min-h-11 items-center gap-2">
                          <input
                            name="default"
                            type="checkbox"
                            defaultChecked={editingAccount.isDefault}
                          />
                          {t("defaultAccount")}
                        </label>
                      )}
                    </>
                  )}
                </>
              ) : mode === "CATEGORY" ? (
                <>
                  {input("nameEn", t("englishName"), editingCategory?.nameEn)}
                  {input("nameBn", t("banglaName"), editingCategory?.nameBn)}
                  {editingCategory && (
                    <label className="flex min-h-11 items-center gap-2">
                      <input type="checkbox" name="archived" />
                      {t("archive")}
                    </label>
                  )}
                </>
              ) : (
                <>
                  {!editing &&
                    accountSelect(
                      "account",
                      mode === "TRANSFER" ? t("fromAccount") : t("account"),
                    )}
                  {mode === "TRANSFER" &&
                    accountSelect("destination", t("toAccount"))}
                  {input(
                    "amount",
                    t("amount"),
                    editing ? editing.amountPaisa / 100 : undefined,
                    "number",
                  )}
                  {mode !== "TRANSFER" && mode !== "EXPENSE" && (
                    <label>
                      {t("category")}
                      <select
                        name="category"
                        defaultValue={editing?.category ?? "OTHER"}
                        className="h-11 w-full rounded border bg-card px-3"
                      >
                        {MANUAL_CASH_CATEGORIES.filter(
                          (value) => value !== "EXPENSE",
                        ).map((value) => (
                          <option key={value} value={value}>
                            {t(`cashCategories.${value}`)}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  {mode === "EXPENSE" && (
                    <label>
                      {t("category")}
                      <select
                        name="expense"
                        required
                        defaultValue={editing?.expenseCategory?.id}
                        className="h-11 w-full rounded border bg-card px-3"
                      >
                        {expenses.data?.map((expense) => (
                          <option key={expense.id} value={expense.id}>
                            {locale === "bn" ? expense.nameBn : expense.nameEn}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  {input(
                    "date",
                    t("date"),
                    editing?.entryDate ?? todayDhaka(),
                    "date",
                  )}
                  {input("note", t("note"), editing?.note ?? "")}
                </>
              )}
              {error && (
                <p role="alert" className="text-danger">
                  {t("saveError")}
                </p>
              )}
              <button className="min-h-11 w-full rounded bg-primary text-primary-foreground">
                {busy ? t("saving") : t("save")}
              </button>
            </fieldset>
          </form>
        </HisabDialog>
      )}
    </section>
  );
}
