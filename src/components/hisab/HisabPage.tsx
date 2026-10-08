"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/common/PageHeader";
import { ErrorState, EmptyState } from "@/components/common/PageStates";
import { HisabSkeleton } from "@/components/common/skeletons";
import { formatMoney } from "@/lib/money";
import { useHisab, usePartyLedger } from "@/hooks/queries/useHisab";
import { PartyList } from "./PartyList";
import { PartyLedger } from "./PartyLedger";
import { hisabApi } from "@/lib/api/hisab.api";
import type { PartyDTO, PartyKind } from "@/types/hisab";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { PartyForm } from "./PartyForm";
import { TagadaDialog } from "./TagadaDialog";
import { CashboxPanel } from "./CashboxPanel";
import { HisabReport } from "./HisabReport";
import { useUiStore } from "@/stores/uiStore";
export default function HisabPage() {
  const t = useTranslations("hisab");
  const params = useSearchParams();
  const router = useRouter();
  const { can } = useCurrentShop();
  const client = useQueryClient();
  const selected = params.get("party") ?? undefined;
  const tab = params.get("tab") ?? "parties";
  const page = Number(params.get("page") ?? 1);
  const { shopId, summary, parties, accounts, addEntry } = useHisab({
    kind: params.get("kind") || undefined,
    search: params.get("search") || undefined,
    sort: params.get("sort") ?? "lastEntry",
    page,
  });
  const change = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    router.replace(`/dashboard/hisab?${next}`);
  };
  const setSelected = (value: string) => change("party", value);
  const [adding, setAdding] = useState(false);
  const [editingParty, setEditingParty] = useState<PartyDTO>();
  const [reminding, setReminding] = useState<PartyDTO>();
  const selectedQuery = useQuery({
    queryKey: ["hisab", shopId, "party", selected],
    queryFn: () => hisabApi.party(shopId!, selected!),
    enabled: Boolean(selected && shopId && can("hisab.read")),
  });
  const selectedParty =
    selectedQuery.data ??
    parties.data?.data.find((party) => party.id === selected) ??
    (!selected ? parties.data?.data[0] : undefined);
  const ledger = usePartyLedger(selectedParty?.id);
  const refresh = () =>
    client.invalidateQueries({ queryKey: ["hisab", shopId] });
  if (!can("hisab.read")) return <EmptyState title={t("readOnly")} />;
  const errorCode = (summary.error as { code?: string } | null)?.code;
  if (errorCode === "FEATURE_NOT_IN_PLAN" || errorCode === "FEATURE_DISABLED")
    return (
      <div className="space-y-4">
        <PageHeader title={t("title")} />
        <p>{t("featureUnavailable")}</p>
        <button
          onClick={() =>
            useUiStore.getState().openUpgrade({ feature: "hisab_khata" })
          }
          className="min-h-11 rounded bg-primary px-4 text-primary-foreground"
        >
          {t("viewPlans")}
        </button>
      </div>
    );
  if (summary.isPending || parties.isPending || accounts.isPending)
    return <HisabSkeleton />;
  if (
    summary.isError ||
    parties.isError ||
    accounts.isError ||
    !summary.data ||
    !parties.data
  )
    return (
      <ErrorState
        onRetry={() => {
          void summary.refetch();
          void parties.refetch();
          void accounts.refetch();
        }}
      />
    );
  const create = async (body: Record<string, unknown>) => {
    const party = await hisabApi.createParty(
      shopId!,
      body as { kind: PartyKind; name: string },
    );
    setSelected(party.id);
    await refresh();
    toast.success(t("saved"));
  };
  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <div className="grid grid-cols-2 gap-3">
        <Stat
          label={t("totalReceivable")}
          value={formatMoney(summary.data.totalReceivablePaisa)}
          tone="text-success"
        />
        <Stat
          label={t("totalPayable")}
          value={formatMoney(summary.data.totalPayablePaisa)}
          tone="text-danger"
        />
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-5">
        {[
          ["todaySales", summary.data.todaySalesPaisa],
          ["todayCollection", summary.data.todayCollectionPaisa],
          ["todayExpense", summary.data.todayExpensePaisa],
          ["courierHolding", summary.data.courierHoldingPaisa],
          ["cashInHand", summary.data.cashInHandPaisa],
        ].map(([key, value]) => (
          <div key={key} className="border-b pb-2">
            <p className="text-muted-foreground">{t(String(key))}</p>
            <p className="font-semibold tabular-nums">
              {formatMoney(Number(value))}
            </p>
          </div>
        ))}
      </div>
      <div className="flex gap-2 border-b" role="tablist">
        {["parties", "cashbox", "report"].map((value) => (
          <button
            role="tab"
            aria-selected={tab === value}
            key={value}
            onClick={() => change("tab", value)}
            className={`min-h-11 border-b-2 px-3 ${tab === value ? "border-primary text-primary" : "border-transparent"}`}
          >
            {t(value)}
          </button>
        ))}
      </div>
      {tab === "cashbox" ? (
        <CashboxPanel accounts={accounts.data ?? []} />
      ) : tab === "report" ? (
        <HisabReport />
      ) : (
        <div className="grid min-w-0 gap-4 md:grid-cols-[minmax(180px,240px)_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_240px]">
          <div className={selected ? "hidden space-y-3 md:block" : "space-y-3"}>
            <div className="space-y-2">
              <label className="block">
                {t("search")}
                <input
                  value={params.get("search") ?? ""}
                  onChange={(event) => change("search", event.target.value)}
                  className="mt-1 h-11 w-full rounded border bg-card px-3 text-base"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  aria-label={t("kind")}
                  value={params.get("kind") ?? ""}
                  onChange={(event) => change("kind", event.target.value)}
                  className="h-11 min-w-0 rounded border bg-card px-2"
                >
                  <option value="">{t("all")}</option>
                  {["CUSTOMER", "SUPPLIER", "OTHER"].map((value) => (
                    <option key={value} value={value}>
                      {t(value.toLowerCase())}
                    </option>
                  ))}
                </select>
                <select
                  aria-label={t("sort")}
                  value={params.get("sort") ?? "lastEntry"}
                  onChange={(event) => change("sort", event.target.value)}
                  className="h-11 min-w-0 rounded border bg-card px-2"
                >
                  {["balance", "oldestDue", "name", "lastEntry"].map(
                    (value) => (
                      <option key={value} value={value}>
                        {t(`sorts.${value}`)}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>
            <PartyList
              parties={parties.data.data}
              selectedId={selectedParty?.id}
              onSelect={setSelected}
              onAdd={() => setAdding(true)}
              onRemind={setReminding}
              t={t}
            />
            <div className="flex justify-between">
              <button
                disabled={page <= 1}
                onClick={() => change("page", String(page - 1))}
                className="min-h-11 px-2"
              >
                {t("previous")}
              </button>
              <span className="py-3">{page}</span>
              <button
                disabled={page >= parties.data.meta.totalPages}
                onClick={() => change("page", String(page + 1))}
                className="min-h-11 px-2"
              >
                {t("next")}
              </button>
            </div>
          </div>
          <div className={!selected ? "hidden min-w-0 md:block" : "min-w-0"}>
            {selected && (
              <button
                onClick={() => change("party", "")}
                className="mb-3 flex min-h-11 items-center gap-2 md:hidden"
              >
                <ArrowLeft className="size-4" />
                {t("parties")}
              </button>
            )}
            {ledger.isPending && selectedParty ? (
              <HisabSkeleton />
            ) : ledger.isError || selectedQuery.isError ? (
              <ErrorState
                onRetry={() => {
                  void ledger.refetch();
                  void selectedQuery.refetch();
                }}
              />
            ) : selectedParty && ledger.data ? (
              <PartyLedger
                party={selectedParty}
                entries={ledger.data.pages.flatMap((page) => page.data)}
                accounts={accounts.data ?? []}
                onEntry={async (body) => {
                  try {
                    const entry = await addEntry.mutateAsync({
                      partyId: selectedParty.id,
                      body,
                    });
                    toast.success(t("saved"), {
                      duration: 5000,
                      action: {
                        label: t("undo"),
                        onClick: () => {
                          void hisabApi
                            .deleteEntry(shopId!, entry.id)
                            .then(refresh)
                            .catch(() => toast.error(t("saveError")));
                        },
                      },
                    });
                  } catch (error) {
                    toast.error(t("saveError"));
                    throw error;
                  }
                }}
                onEditParty={() => setEditingParty(selectedParty)}
                onRemind={() => setReminding(selectedParty)}
                onArchive={() => {
                  if (window.confirm(t("confirmArchive")))
                    void hisabApi
                      .archiveParty(shopId!, selectedParty.id, true)
                      .then(() => {
                        change("party", "");
                        return refresh();
                      })
                      .catch(() => toast.error(t("saveError")));
                }}
                hasMore={ledger.hasNextPage}
                onLoadMore={() => void ledger.fetchNextPage()}
                busy={addEntry.isPending}
                t={t}
              />
            ) : (
              <EmptyState title={t("selectParty")} />
            )}
          </div>
          <div className="hidden min-w-0 border-l pl-4 xl:block">
            <CashboxPanel mini accounts={accounts.data ?? []} />
          </div>
        </div>
      )}
      {adding && can("hisab.write") && (
        <PartyForm
          onClose={() => setAdding(false)}
          onSave={create}
          onCustomer={async (id) => {
            const party = await hisabApi.fromCustomer(shopId!, id);
            setSelected(party.id);
            await refresh();
          }}
        />
      )}
      {editingParty && (
        <PartyForm
          party={editingParty}
          onClose={() => setEditingParty(undefined)}
          onSave={async (body) => {
            await hisabApi.updateParty(shopId!, editingParty.id, body);
            await refresh();
          }}
        />
      )}
      {reminding && can("hisab.write") && (
        <TagadaDialog
          party={reminding}
          onClose={() => setReminding(undefined)}
        />
      )}
    </div>
  );
}
function Stat({
  label,
  value,
  tone = "",
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${tone}`}>{value}</p>
    </div>
  );
}
