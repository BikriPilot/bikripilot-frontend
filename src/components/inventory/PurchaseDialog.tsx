"use client";
import { useState } from "react";
import type { ProductListItemDTO } from "@/types/product";
import { Field, TextField } from "@/components/common/Field";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { hisabApi } from "@/lib/api/hisab.api";
import { productsApi } from "@/lib/api/products.api";
import { toLatinDigits } from "@/lib/phone";
import { formatMoney } from "@/lib/money";
import { HisabDialog } from "@/components/hisab/PartyForm";
import { todayDhaka } from "@/components/hisab/EntrySheet";
import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";
const purchaseSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().optional(),
        quantity: z.number().int().positive().max(1000000),
        unitCostPaisa: z.number().int().min(0).max(1000000000),
      }),
    )
    .min(1)
    .max(100),
  paidAmountPaisa: z.number().int().min(0),
  entryDate: z.iso.date(),
});
export function PurchaseDialog({
  products,
  busy,
  onClose,
  onSave,
  t,
}: {
  products: ProductListItemDTO[];
  busy: boolean;
  onClose: () => void;
  onSave: (body: Record<string, unknown>) => void;
  t: (key: string) => string;
}) {
  const h = useTranslations("hisab");
  const { shopId, can } = useCurrentShop();
  const [lines, setLines] = useState([
    {
      key: crypto.randomUUID(),
      productId: products[0]?.id ?? "",
      variantId: "",
      quantity: "1",
      cost: "",
    },
  ]);
  const [supplier, setSupplier] = useState("");
  const [paid, setPaid] = useState("0");
  const [account, setAccount] = useState("");
  const [date, setDate] = useState(todayDhaka());
  const [invalid, setInvalid] = useState(false);
  const suppliers = useQuery({
    queryKey: ["hisab", shopId, "purchase-suppliers"],
    queryFn: () =>
      hisabApi.parties(shopId!, {
        kind: "SUPPLIER",
        archived: false,
        page: 1,
        limit: 100,
      }),
    enabled: Boolean(shopId && can("hisab.read")),
  });
  const accounts = useQuery({
    queryKey: ["hisab", shopId, "accounts"],
    queryFn: () => hisabApi.accounts(shopId!),
    enabled: Boolean(shopId && can("hisab.read")),
  });
  const details = useQuery({
    queryKey: [
      "purchase-products",
      shopId,
      lines.map((line) => line.productId),
    ],
    queryFn: () =>
      Promise.all(
        [...new Set(lines.map((line) => line.productId).filter(Boolean))].map(
          (id) => productsApi.get(shopId!, id),
        ),
      ),
    enabled: Boolean(shopId && lines.some((line) => line.productId)),
  });
  const update = (
    key: string,
    field: "productId" | "variantId" | "quantity" | "cost",
    value: string,
  ) =>
    setLines((current) =>
      current.map((line) =>
        line.key === key
          ? {
              ...line,
              [field]: value,
              ...(field === "productId" ? { variantId: "" } : {}),
            }
          : line,
      ),
    );
  const items = lines.map((line) => ({
    productId: line.productId,
    variantId: line.variantId || undefined,
    quantity: Number(line.quantity),
    unitCostPaisa: Math.round(Number(line.cost) * 100),
  }));
  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.unitCostPaisa,
    0,
  );
  const [note, setNote] = useState("");
  return (
    <HisabDialog title={t("purchaseTitle")} onClose={onClose} busy={busy}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const paidAmountPaisa = Math.round(Number(paid) * 100);
          const body = { items, paidAmountPaisa, entryDate: date };
          if (
            !purchaseSchema.safeParse(body).success ||
            lines.some((line) => line.cost === "") ||
            date > todayDhaka() ||
            paidAmountPaisa > total ||
            (paidAmountPaisa > 0 && !account) ||
            details.data?.some(
              (product) =>
                !product.trackStock ||
                (product.hasVariants &&
                  lines.some(
                    (line) => line.productId === product.id && !line.variantId,
                  )),
            )
          ) {
            setInvalid(true);
            return;
          }
          setInvalid(false);
          onSave({
            ...body,
            supplierPartyId: supplier || undefined,
            moneyAccountId: account || undefined,
            note: note || undefined,
          });
        }}
        className="space-y-4"
      >
        <fieldset disabled={busy} className="space-y-4">
          {can("hisab.read") && (
            <label className="block">
              {h("supplier")}
              <select
                value={supplier}
                onChange={(event) => setSupplier(event.target.value)}
                className="mt-1 h-11 w-full rounded border bg-card px-3"
              >
                <option value="">{h("none")}</option>
                {suppliers.data?.data.map((party) => (
                  <option key={party.id} value={party.id}>
                    {party.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {lines.map((line) => {
            const product = details.data?.find(
              (product) => product.id === line.productId,
            );
            return (
              <div key={line.key} className="space-y-3 border-b pb-4">
                <label className="block">
                  {h("product")}
                  <select
                    value={line.productId}
                    onChange={(event) =>
                      update(line.key, "productId", event.target.value)
                    }
                    className="mt-1 h-11 w-full rounded border bg-card px-3"
                  >
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </label>
                {product?.hasVariants && (
                  <label className="block">
                    {h("variant")}
                    <select
                      required
                      value={line.variantId}
                      onChange={(event) =>
                        update(line.key, "variantId", event.target.value)
                      }
                      className="mt-1 h-11 w-full rounded border bg-card px-3"
                    >
                      <option value="">{h("selectVariant")}</option>
                      {product.variants
                        .filter((variant) => variant.isActive)
                        .map((variant) => (
                          <option key={variant.id} value={variant.id}>
                            {variant.name}
                          </option>
                        ))}
                    </select>
                  </label>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label={t("quantity")}
                    value={line.quantity}
                    inputMode="numeric"
                    onChange={(event) =>
                      update(
                        line.key,
                        "quantity",
                        toLatinDigits(event.target.value).replace(/\D/g, ""),
                      )
                    }
                  />
                  <Field
                    label={t("unitCost")}
                    value={line.cost}
                    inputMode="decimal"
                    onChange={(event) => {
                      const value = toLatinDigits(event.target.value);
                      if (/^\d*(\.\d{0,2})?$/.test(value))
                        update(line.key, "cost", value);
                    }}
                  />
                </div>
                {lines.length > 1 && (
                  <button
                    type="button"
                    title={h("removeLine")}
                    aria-label={h("removeLine")}
                    onClick={() =>
                      setLines(lines.filter((item) => item.key !== line.key))
                    }
                    className="grid size-11 place-items-center"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            );
          })}
          <button
            type="button"
            disabled={lines.length >= 100}
            onClick={() =>
              setLines([
                ...lines,
                {
                  key: crypto.randomUUID(),
                  productId: products[0]?.id ?? "",
                  variantId: "",
                  quantity: "1",
                  cost: "",
                },
              ])
            }
            className="flex min-h-11 items-center gap-2 rounded border px-3"
          >
            <Plus className="size-4" />
            {h("addLine")}
          </button>
          <p className="font-semibold">
            {h("total")}: {formatMoney(total)}
          </p>
          <Field
            label={h("paidNow")}
            value={paid}
            inputMode="decimal"
            onChange={(event) => {
              const value = toLatinDigits(event.target.value);
              if (/^\d*(\.\d{0,2})?$/.test(value)) setPaid(value);
            }}
          />
          {Number(paid) > 0 && (
            <label className="block">
              {h("account")}
              <select
                required
                value={account}
                onChange={(event) => setAccount(event.target.value)}
                className="mt-1 h-11 w-full rounded border bg-card px-3"
              >
                <option value="">{h("selectAccount")}</option>
                {accounts.data
                  ?.filter((account) => account.kind !== "COURIER")
                  .map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
              </select>
            </label>
          )}
          <Field
            label={h("date")}
            type="date"
            value={date}
            max={todayDhaka()}
            required
            onChange={(event) => setDate(event.target.value)}
          />
          <TextField
            label={t("note")}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 flex-1 rounded-lg border"
            >
              {t("cancel")}
            </button>
            <button
              disabled={busy || !products.length || details.isPending}
              className="min-h-11 flex-1 rounded-lg bg-primary text-primary-foreground"
            >
              {busy ? h("saving") : h("save")}
            </button>
          </div>
          {invalid && (
            <p role="alert" className="text-danger">
              {h("invalidPurchase")}
            </p>
          )}
        </fieldset>
      </form>
    </HisabDialog>
  );
}
