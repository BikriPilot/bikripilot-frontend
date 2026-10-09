"use client";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { OrderDTO } from "@/types/order";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { useOrderMutations } from "@/hooks/queries/useOrders";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { productsApi } from "@/lib/api/products.api";
import { shopsApi } from "@/lib/api/shops.api";
import { ordersApi } from "@/lib/api/orders.api";
import { customersApi } from "@/lib/api/customers.api";
import { BD_DISTRICTS, suggestDeliveryZone } from "@/constants/districts";
import { PAYMENT_METHODS, DELIVERY_ZONES } from "@/constants/enums";
import { formatMoney } from "@/lib/money";
import { Field, TextField } from "@/components/common/Field";
import { ErrorState } from "@/components/common/PageStates";
import { FormSkeleton } from "@/components/common/skeletons";

type Line = {
  key: number;
  productId: string;
  variantId: string;
  quantity: number;
  unitPricePaisa?: number;
};
export function OrderForm({
  initialOrder,
  onSaved,
}: { initialOrder?: OrderDTO; onSaved?: () => void } = {}) {
  const t = useTranslations("orders");
  const enums = useTranslations("enums");
  const router = useRouter();
  const { shopId, can } = useCurrentShop();
  const client = useQueryClient();
  const createMutation = useOrderMutations().create;
  const updateMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      ordersApi.update(shopId!, initialOrder!.id, body),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["orders", shopId] });
      await client.invalidateQueries({ queryKey: ["hisab", shopId] });
    },
  });
  const mutation = initialOrder ? updateMutation : createMutation;
  const [customerName, setName] = useState(initialOrder?.customerName ?? "");
  const [customerPhone, setPhone] = useState(initialOrder?.customerPhone ?? "");
  const [address, setAddress] = useState(initialOrder?.address ?? "");
  const [district, setDistrict] = useState(initialOrder?.district ?? "");
  const [zone, setZone] = useState(
    initialOrder?.deliveryZone ?? "INSIDE_DHAKA",
  );
  const [discount, setDiscount] = useState(
    (initialOrder?.discountPaisa ?? 0) / 100,
  );
  const [delivery, setDelivery] = useState<string>(
    initialOrder ? String(initialOrder.deliveryChargePaisa / 100) : "",
  );
  const [lines, setLines] = useState<Line[]>(
    initialOrder
      ? initialOrder.items.map((item, index) => ({
          key: index + 1,
          productId: item.productId ?? "",
          variantId: item.variantId ?? "",
          quantity: item.quantity,
          unitPricePaisa: item.unitPricePaisa,
        }))
      : [{ key: 1, productId: "", variantId: "", quantity: 1 }],
  );
  const products = useQuery({
    queryKey: ["products", shopId, "order-picker"],
    queryFn: () =>
      productsApi.list(shopId!, { page: 1, limit: 100, status: "ACTIVE" }),
    enabled: Boolean(shopId),
  });
  const settings = useQuery({
    queryKey: ["shopSettings", shopId],
    queryFn: () => shopsApi.settings(shopId!),
    enabled: Boolean(shopId),
  });
  const details = useQuery({
    queryKey: [
      "products",
      shopId,
      "order-variants",
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
  const body = {
    customerName,
    customerPhone,
    address,
    district: district || null,
    deliveryZone: zone,
    discountPaisa: Math.round(discount * 100),
    ...(delivery !== ""
      ? { deliveryChargePaisa: Math.round(Number(delivery) * 100) }
      : {}),
    items: lines
      .filter((line) => line.productId)
      .map((line) => ({
        productId: line.productId,
        variantId: line.variantId || null,
        quantity: line.quantity,
        ...(line.unitPricePaisa !== undefined
          ? { unitPricePaisa: line.unitPricePaisa }
          : {}),
      })),
  };
  const serializedBody = JSON.stringify(body);
  const [quoteBody, setQuoteBody] = useState(body);
  useEffect(() => {
    const timer = setTimeout(
      () => setQuoteBody(JSON.parse(serializedBody)),
      300,
    );
    return () => clearTimeout(timer);
  }, [serializedBody]);
  const quote = useQuery({
    queryKey: ["orders", shopId, "quote", quoteBody],
    queryFn: () =>
      ordersApi.quote(shopId!, {
        ...quoteBody,
        advancePaidPaisa: initialOrder?.advancePaidPaisa ?? 0,
      }),
    enabled: Boolean(shopId && body.items.length && !details.isPending),
  });
  const lookup = useQuery({
    queryKey: ["customers", shopId, "lookup", quoteBody.customerPhone],
    queryFn: () => customersApi.lookup(shopId!, quoteBody.customerPhone),
    enabled: Boolean(
      shopId &&
      can("customer.read") &&
      /^01[3-9]\d{8}$/.test(quoteBody.customerPhone),
    ),
  });
  const duplicate = useQuery({
    queryKey: [
      "orders",
      shopId,
      "duplicate",
      quoteBody.customerPhone,
      quoteBody.items.map((item) => item.productId),
    ],
    queryFn: () =>
      ordersApi.checkDuplicate(shopId!, {
        phone: quoteBody.customerPhone,
        productIds: quoteBody.items.map((item) => item.productId),
      }),
    enabled: Boolean(
      shopId &&
      can("order.read") &&
      /^01[3-9]\d{8}$/.test(quoteBody.customerPhone),
    ),
  });
  const changeLine = (key: number, values: Partial<Line>) =>
    setLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...values } : line)),
    );
  if (!can("order.write")) return <ErrorState />;
  if (products.isPending || settings.isPending) return <FormSkeleton />;
  if (products.isError || settings.isError)
    return (
      <ErrorState
        onRetry={() => {
          void products.refetch();
          void settings.refetch();
        }}
      />
    );
  return (
    <form
      className="mx-auto max-w-3xl space-y-6"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(
          event.currentTarget,
          (event.nativeEvent as SubmitEvent).submitter,
        );
        const status =
          initialOrder?.status ?? String(form.get("status") || "PENDING");
        if (
          status !== "DRAFT" &&
          (!body.items.length ||
            !/^01[3-9]\d{8}$/.test(customerPhone) ||
            !customerName.trim() ||
            !address.trim())
        ) {
          toast.error(t("form.invalid"));
          return;
        }
        try {
          const order = await mutation.mutateAsync({
            ...body,
            ...(!initialOrder ? { status, source: "MANUAL" } : {}),
            paymentMethod: form.get("paymentMethod"),
            note: String(form.get("note") || "") || null,
          });
          toast.success(t("saved"));
          if (onSaved) onSaved();
          else router.push(`/dashboard/orders/${order.id}`);
        } catch {
          toast.error(t("saveError"));
        }
      }}
    >
      <h1 className="text-2xl font-semibold">
        {initialOrder ? t("form.edit") : t("newOrder")}
      </h1>
      {lookup.data && lookup.data.phone === customerPhone && (
        <button
          type="button"
          className="min-h-11 rounded-lg border px-4"
          onClick={() => {
            const customer = lookup.data!;
            setName((current) => current || customer.name || "");
            setAddress((current) => current || customer.address || "");
            setDistrict((current) => current || customer.district || "");
            if (!district && customer.district)
              setZone(suggestDeliveryZone(customer.district));
          }}
        >
          {t("form.useCustomer")}
        </button>
      )}
      {lookup.data?.isBlocked && (
        <p
          role="status"
          className="rounded-lg border border-danger p-3 text-danger"
        >
          {t("form.blockedCustomer")}
        </p>
      )}
      {duplicate.data?.isDuplicateSuspect && (
        <div role="status" className="rounded-lg border border-warning p-3">
          <p>{t("form.duplicate")}</p>
          <div className="flex flex-wrap gap-3">
            {duplicate.data.matches.map((match) => (
              <Link
                key={match.orderId}
                href={`/dashboard/orders/${match.orderId}`}
                className="underline"
              >
                {match.orderNumber}
              </Link>
            ))}
          </div>
        </div>
      )}
      <section className="grid gap-4 sm:grid-cols-2">
        <Field
          label={t("phone")}
          value={customerPhone}
          inputMode="tel"
          onChange={(event) =>
            setPhone(
              event.target.value
                .replace(/[০-৯]/g, (digit) =>
                  String(digit.charCodeAt(0) - 0x09e6),
                )
                .replace(/[^0-9]/g, ""),
            )
          }
          maxLength={11}
        />
        <Field
          label={t("customerName")}
          value={customerName}
          onChange={(event) => setName(event.target.value)}
        />
        <div className="sm:col-span-2">
          <TextField
            label={t("address")}
            value={address}
            onChange={(event) => setAddress(event.target.value)}
          />
        </div>
        <label className="grid gap-2 text-sm">
          {t("district")}
          <select
            className="min-h-11 rounded-lg border bg-card px-3 text-base"
            value={district}
            onChange={(event) => {
              setDistrict(event.target.value);
              setZone(suggestDeliveryZone(event.target.value));
            }}
          >
            <option value="">{t("district")}</option>
            {BD_DISTRICTS.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          {t("form.zone")}
          <select
            className="min-h-11 rounded-lg border bg-card px-3 text-base"
            value={zone}
            onChange={(event) => setZone(event.target.value)}
          >
            {DELIVERY_ZONES.map((value) => (
              <option key={value} value={value}>
                {enums(`DeliveryZone.${value}`)}
              </option>
            ))}
          </select>
        </label>
      </section>
      <section className="space-y-4 border-y py-5">
        <h2 className="font-semibold">{t("items")}</h2>
        {lines.map((line) => {
          const product = details.data?.find(
            (item) => item.id === line.productId,
          );
          return (
            <div key={line.key} className="grid items-end gap-3 sm:grid-cols-2">
              <label className="grid gap-2 text-sm">
                {t("product")}
                <select
                  className="min-h-11 min-w-0 rounded-lg border bg-card px-3 text-base"
                  value={line.productId}
                  onChange={(event) =>
                    changeLine(line.key, {
                      productId: event.target.value,
                      variantId: "",
                      unitPricePaisa: undefined,
                    })
                  }
                >
                  <option value="">{t("selectProduct")}</option>
                  {products.data?.data.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm">
                {t("form.variant")}
                <select
                  className="min-h-11 min-w-0 rounded-lg border bg-card px-3 text-base"
                  disabled={!product?.hasVariants}
                  value={line.variantId}
                  onChange={(event) =>
                    changeLine(line.key, {
                      variantId: event.target.value,
                      unitPricePaisa: undefined,
                    })
                  }
                >
                  <option value="">{t("form.variant")}</option>
                  {product?.variants
                    .filter((variant) => variant.isActive)
                    .map((variant) => (
                      <option key={variant.id} value={variant.id}>
                        {variant.name}
                      </option>
                    ))}
                </select>
              </label>
              <Field
                label={t("quantity")}
                type="number"
                min={1}
                max={999}
                value={line.quantity}
                onChange={(event) =>
                  changeLine(line.key, { quantity: Number(event.target.value) })
                }
              />
              <Field
                label={t("form.unitPrice")}
                type="number"
                min={0}
                step="0.01"
                value={
                  (line.unitPricePaisa ??
                    product?.variants.find(
                      (variant) => variant.id === line.variantId,
                    )?.effectivePricePaisa ??
                    product?.pricePaisa ??
                    0) / 100
                }
                onChange={(event) =>
                  changeLine(line.key, {
                    unitPricePaisa: Math.round(
                      Number(event.target.value) * 100,
                    ),
                  })
                }
              />
              <button
                type="button"
                title={t("form.remove")}
                aria-label={t("form.remove")}
                className="grid size-11 place-items-center rounded-lg border"
                disabled={lines.length === 1}
                onClick={() =>
                  setLines((current) =>
                    current.filter((item) => item.key !== line.key),
                  )
                }
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
        <button
          type="button"
          disabled={lines.length >= 50}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-4"
          onClick={() =>
            setLines((current) => [
              ...current,
              { key: Date.now(), productId: "", variantId: "", quantity: 1 },
            ])
          }
        >
          <Plus size={16} />
          {t("form.addItem")}
        </button>
      </section>
      <section className="grid gap-4 sm:grid-cols-2">
        <Field
          label={t("discount")}
          type="number"
          min={0}
          step="0.01"
          value={discount}
          onChange={(event) => setDiscount(Number(event.target.value))}
        />
        <Field
          label={t("deliveryCharge")}
          type="number"
          min={0}
          step="0.01"
          value={delivery}
          placeholder={t("form.automatic")}
          onChange={(event) => setDelivery(event.target.value)}
        />
        <label className="grid gap-2 text-sm">
          {t("advance.method")}
          <select
            name="paymentMethod"
            className="min-h-11 rounded-lg border bg-card px-3 text-base"
            defaultValue={
              initialOrder?.paymentMethod ?? settings.data?.defaultPaymentMethod
            }
          >
            {PAYMENT_METHODS.map((value) => (
              <option key={value} value={value}>
                {enums(`PaymentMethod.${value}`)}
              </option>
            ))}
          </select>
        </label>
        <TextField
          label={t("form.note")}
          name="note"
          defaultValue={initialOrder?.note ?? ""}
        />
      </section>
      {quote.isError && <ErrorState onRetry={() => void quote.refetch()} />}
      {quote.data && (
        <dl className="space-y-2 border-y py-4">
          {[
            [t("subtotal"), quote.data.subtotalPaisa],
            [t("discount"), -quote.data.discountPaisa],
            [t("deliveryCharge"), quote.data.deliveryChargePaisa],
            [t("total"), quote.data.totalPaisa],
          ].map(([label, amount]) => (
            <div key={label} className="flex justify-between gap-3">
              <dt>{label}</dt>
              <dd className="font-semibold tabular-nums">
                {formatMoney(Number(amount))}
              </dd>
            </div>
          ))}
          <div className="flex justify-between">
            <dt>{t("form.readiness")}</dt>
            <dd>{quote.data.readinessScore}/100</dd>
          </div>
          {quote.data.missingFields.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {quote.data.missingFields.map((field) => (
                <span key={field} className="text-sm text-muted-foreground">
                  {t(`form.missing.${field}`)}
                </span>
              ))}
            </div>
          )}
        </dl>
      )}
      <div className="flex flex-wrap gap-3 pb-5">
        <button
          name="status"
          value="PENDING"
          disabled={mutation.isPending || quote.isError}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-primary-foreground"
        >
          <Save size={16} />
          {mutation.isPending
            ? t("saving")
            : initialOrder
              ? t("save")
              : t("form.pending")}
        </button>
        {!initialOrder && (
          <button
            name="status"
            value="DRAFT"
            disabled={mutation.isPending}
            formNoValidate
            className="min-h-11 rounded-lg border px-4"
          >
            {t("form.draft")}
          </button>
        )}
      </div>
    </form>
  );
}
