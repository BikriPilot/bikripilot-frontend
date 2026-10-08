"use client";
import { Plus, MessageCircle } from "lucide-react";
import type { PartyDTO } from "@/types/hisab";
import { formatMoney } from "@/lib/money";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { formatDate } from "@/lib/date";
export function PartyList({
  parties,
  selectedId,
  onSelect,
  onAdd,
  onRemind,
  t,
}: {
  parties: PartyDTO[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onRemind: (party: PartyDTO) => void;
  t: (key: string) => string;
}) {
  const { can } = useCurrentShop();
  return (
    <section className="rounded-2xl border bg-card p-3">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">{t("parties")}</h2>
        {can("hisab.write") && (
          <button
            onClick={onAdd}
            className="flex min-h-10 items-center gap-1 rounded-lg bg-primary px-3 text-sm text-primary-foreground"
          >
            <Plus className="size-4" />
            {t("addParty")}
          </button>
        )}
      </div>
      <div className="space-y-2">
        {parties.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            {t("emptyParties")}
          </p>
        ) : (
          parties.map((p) => (
            <div
              key={p.id}
              className={`flex min-h-16 w-full items-center justify-between rounded-xl border p-3 text-left ${selectedId === p.id ? "border-primary bg-primary/5" : ""}`}
            >
              <button
                onClick={() => onSelect(p.id)}
                className="min-h-11 min-w-0 flex-1 text-left"
              >
                <span className="block break-words font-medium">{p.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {p.phone || t("noPhone")}
                </span>
                {p.lastEntryAt && (
                  <span className="block text-xs text-muted-foreground">
                    {formatDate(p.lastEntryAt)}
                  </span>
                )}
              </button>
              <span className="flex items-center gap-1">
                <span
                  className={`text-sm font-semibold ${p.balancePaisa > 0 ? "text-success" : p.balancePaisa < 0 ? "text-danger" : "text-muted-foreground"}`}
                >
                  {formatMoney(Math.abs(p.balancePaisa))}
                  <span className="block text-xs font-normal">
                    {p.balancePaisa > 0
                      ? t("youllGet")
                      : p.balancePaisa < 0
                        ? t("youllGive")
                        : t("settled")}
                  </span>
                </span>
                {can("hisab.write") &&
                p.balancePaisa > 0 &&
                p.phone &&
                !p.reminderOptOut ? (
                  <button
                    title={t("reminder")}
                    aria-label={t("reminder")}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemind(p);
                    }}
                    className="grid size-11 place-items-center rounded-md text-success hover:bg-muted"
                  >
                    <MessageCircle className="size-4" />
                  </button>
                ) : null}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
