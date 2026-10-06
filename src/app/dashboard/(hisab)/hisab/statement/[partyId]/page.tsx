"use client";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePartyStatement } from "@/hooks/queries/useHisab";
import { formatMoney } from "@/lib/money";
import { ErrorState } from "@/components/common/PageStates";
import { HisabSkeleton } from "@/components/common/skeletons";
export default function StatementPage() {
  const t = useTranslations("hisab"); const { partyId } = useParams<{ partyId: string }>(); const query = usePartyStatement(partyId);
  if (query.isPending) return <HisabSkeleton />; if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} />;
  const data = query.data;
  return <main className="mx-auto max-w-3xl space-y-5 bg-white p-5 text-black print:max-w-none print:p-0"><div className="flex items-start justify-between border-b pb-4"><div><h1 className="text-2xl font-bold">{data.shop.name}</h1><p>{data.shop.phone || ""} {data.shop.address || ""}</p></div><button onClick={() => window.print()} className="rounded-lg bg-black px-4 py-2 text-sm text-white print:hidden">{t("print")}</button></div><h2 className="text-xl font-semibold">{t("statement")} — {data.party.name}</h2><p className="text-sm">{data.from} — {data.to}</p><div className="grid grid-cols-3 gap-3 border-y py-4 text-sm"><p>{t("opening")}: {formatMoney(data.openingBalancePaisa)}</p><p>{t("gave")}: {formatMoney(data.totals.gavePaisa)}</p><p>{t("got")}: {formatMoney(data.totals.gotPaisa)}</p></div><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="p-2">{t("date")}</th><th className="p-2">{t("note")}</th><th className="p-2">{t("gave")}</th><th className="p-2">{t("got")}</th><th className="p-2">{t("balance")}</th></tr></thead><tbody>{data.entries.map(e => <tr key={e.id} className="border-b"><td className="p-2">{e.entryDate}</td><td className="p-2">{e.sourceLabel || e.note || "—"}</td><td className="p-2">{e.direction === "GAVE" ? formatMoney(e.amountPaisa) : "—"}</td><td className="p-2">{e.direction === "GOT" ? formatMoney(e.amountPaisa) : "—"}</td><td className="p-2">{formatMoney(Math.abs(e.runningBalancePaisa))}</td></tr>)}</tbody></table><p className="border-t pt-4 text-right text-lg font-bold">{t("closing")}: {formatMoney(data.closingBalancePaisa)}</p></main>;
}
