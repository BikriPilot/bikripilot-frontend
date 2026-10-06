"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Field, TextField } from "@/components/common/Field";
import { useStockAdjust } from "@/hooks/queries/useInventory";

export function StockAdjustDialog({ productId, onDone }: { productId: string; onDone?: () => void }) {
  const t = useTranslations("inventory");
  const mutation = useStockAdjust();
  const [open, setOpen] = useState(false);
  const [change, setChange] = useState("");
  const [note, setNote] = useState("");
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(change);
    if (!Number.isInteger(amount) || amount === 0) return;
    try {
      await mutation.mutateAsync({ productId, change: amount, reason: amount < 0 ? "DAMAGED" : "ADJUSTMENT", note: note || undefined });
      toast.success(t("adjusted")); setOpen(false); setChange(""); setNote(""); onDone?.();
    } catch { toast.error(t("adjustError")); }
  };
  return <>{open ? <div className="fixed inset-0 z-50 grid items-end bg-foreground/30 p-4 sm:items-center"><form onSubmit={submit} className="mx-auto w-full max-w-md space-y-4 rounded-2xl border bg-card p-5 shadow-xl"><h2 className="text-lg font-semibold">{t("adjustTitle")}</h2><Field label={t("change")} inputMode="numeric" value={change} onChange={(e) => setChange(e.target.value.replace(/[^\d-]/g, ""))} required /><TextField label={t("note")} value={note} onChange={(e) => setNote(e.target.value)} /><div className="flex justify-end gap-3"><button type="button" onClick={() => setOpen(false)} className="min-h-11 rounded-lg border px-4 text-sm font-semibold">{t("cancel")}</button><button disabled={mutation.isPending} className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">{t("adjust")}</button></div></form></div> : null}<button type="button" onClick={() => setOpen(true)} className="min-h-10 rounded-lg border px-3 text-sm font-semibold">{t("adjust")}</button></>;
}
