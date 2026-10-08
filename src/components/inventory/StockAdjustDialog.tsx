"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Field, TextField } from "@/components/common/Field";
import { useStockAdjust } from "@/hooks/queries/useInventory";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api/products.api";
import { toLatinDigits } from "@/lib/phone";

export function StockAdjustDialog({
  productId,
  onDone,
}: {
  productId: string;
  onDone?: () => void;
}) {
  const t = useTranslations("inventory");
  const mutation = useStockAdjust();
  const { shopId, can } = useCurrentShop();
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [change, setChange] = useState("");
  const [note, setNote] = useState("");
  const [variantId, setVariantId] = useState("");
  const [reason, setReason] = useState<"ADJUSTMENT" | "DAMAGED">("ADJUSTMENT");
  const product = useQuery({
    queryKey: ["products", shopId, "detail", productId],
    queryFn: () => productsApi.get(shopId!, productId),
    enabled: open && Boolean(shopId),
  });
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(toLatinDigits(change));
    if (
      !can("inventory.write") ||
      !product.data ||
      !Number.isInteger(amount) ||
      amount === 0 ||
      (product.data.hasVariants && !variantId)
    )
      return;
    try {
      await mutation.mutateAsync({
        productId,
        variantId: product.data.hasVariants ? variantId : undefined,
        change: amount,
        reason,
        note: note || undefined,
      });
      toast.success(t("adjusted"));
      setOpen(false);
      setChange("");
      setNote("");
      setVariantId("");
      onDone?.();
    } catch {
      toast.error(t("adjustError"));
    }
  };
  if (!can("inventory.write")) return null;
  return (
    <>
      <dialog
        ref={dialog}
        onCancel={() => setOpen(false)}
        onClose={() => setOpen(false)}
        aria-label={t("adjustTitle")}
        className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-lg border bg-card p-5 text-foreground shadow-xl backdrop:bg-black/40"
      >
        <form onSubmit={submit} className="space-y-4">
          <h2 className="text-lg font-semibold">{t("adjustTitle")}</h2>
          {product.isError ? (
            <p role="alert" className="text-sm text-danger">
              {t("adjustError")}
            </p>
          ) : null}
          {product.data?.hasVariants ? (
            <label className="grid gap-1.5 text-sm">
              <span>{t("variant")}</span>
              <select
                required
                value={variantId}
                onChange={(event) => setVariantId(event.target.value)}
                className="h-11 rounded-lg border bg-card px-3"
              >
                <option value="">{t("selectVariant")}</option>
                {product.data.variants
                  .filter((variant) => variant.isActive)
                  .map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {variant.name} ({variant.stockQuantity})
                    </option>
                  ))}
              </select>
            </label>
          ) : null}
          <Field
            label={t("change")}
            inputMode="text"
            value={change}
            onChange={(event) =>
              setChange(
                toLatinDigits(event.target.value).replace(/[^\d-]/g, ""),
              )
            }
            required
          />
          <label className="grid gap-1.5 text-sm">
            <span>{t("reason")}</span>
            <select
              value={reason}
              onChange={(event) =>
                setReason(event.target.value as typeof reason)
              }
              className="h-11 rounded-lg border bg-card px-3"
            >
              <option value="ADJUSTMENT">{t("adjustmentReason")}</option>
              <option value="DAMAGED">{t("damagedReason")}</option>
            </select>
          </label>
          <TextField
            label={t("note")}
            value={note}
            maxLength={2000}
            onChange={(event) => setNote(event.target.value)}
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="min-h-11 rounded-lg border px-4 text-sm font-semibold"
            >
              {t("cancel")}
            </button>
            <button
              disabled={
                mutation.isPending ||
                !product.data ||
                (product.data.hasVariants && !variantId)
              }
              className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              {t("adjust")}
            </button>
          </div>
        </form>
      </dialog>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-11 rounded-lg border px-3 text-sm font-semibold"
      >
        {t("adjust")}
      </button>
    </>
  );
}
