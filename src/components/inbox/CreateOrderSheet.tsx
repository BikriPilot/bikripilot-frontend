"use client";

import { useState } from "react";
import { X, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useProducts } from "@/hooks/queries/useProducts";
import { useOrderMutations } from "@/hooks/queries/useOrders";
import { BD_DISTRICTS, suggestDeliveryZone } from "@/constants/districts";
import type { DeliveryZoneValue } from "@/constants/enums";

interface CreateOrderSheetProps {
  open: boolean;
  onClose: () => void;
  customerName?: string | null;
  customerPhone?: string | null;
  customerId?: string;
  conversationId: string;
  address?: string | null;
  district?: string | null;
}

export function CreateOrderSheet({
  open,
  onClose,
  customerName,
  customerPhone,
  customerId,
  conversationId,
  address,
  district,
}: CreateOrderSheetProps) {
  const t = useTranslations("inbox");
  const { data: productsData, isLoading: loadingProducts } = useProducts({
    page: 1,
    limit: 100,
  });
  const orderMutations = useOrderMutations();

  const [name, setName] = useState(customerName ?? "");
  const [phone, setPhone] = useState(customerPhone ?? "");
  const [addr, setAddr] = useState(address ?? "");
  const [dist, setDist] = useState(district ?? "Dhaka");
  const [zone, setZone] = useState<DeliveryZoneValue>(
    suggestDeliveryZone(district ?? "Dhaka"),
  );
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  if (!open) return null;

  const handleDistrictChange = (d: string) => {
    setDist(d);
    setZone(suggestDeliveryZone(d));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      toast.error(t("selectProductRequired"));
      return;
    }

    try {
      await orderMutations.create.mutateAsync({
        status: "PENDING",
        source: "MESSENGER",
        customerId: customerId || undefined,
        conversationId,
        customerName: name.trim(),
        customerPhone: phone.trim(),
        address: addr.trim(),
        district: dist || null,
        deliveryZone: zone,
        items: [
          {
            productId: selectedProductId,
            quantity: Number(quantity) || 1,
          },
        ],
        paymentMethod: "COD",
        note: note.trim() || null,
      });

      toast.success(t("orderCreatedSuccess"));
      onClose();
    } catch {
      toast.error(t("orderCreateFailed"));
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-lg flex-col border-l bg-card shadow-2xl animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2 font-semibold">
            <ShoppingBag size={18} className="text-primary" />
            <span>{t("createOrder")}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              {t("customerName")} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              {t("phone")} *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              {t("address")} *
            </label>
            <textarea
              required
              rows={2}
              value={addr}
              onChange={(e) => setAddr(e.target.value)}
              className="w-full rounded-lg border bg-background p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                {t("district")}
              </label>
              <select
                value={dist}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {BD_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                {t("deliveryZone")}
              </label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value as DeliveryZoneValue)}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="INSIDE_DHAKA">{t("zoneInsideDhaka")}</option>
                <option value="SUB_DHAKA">{t("zoneSubDhaka")}</option>
                <option value="OUTSIDE_DHAKA">{t("zoneOutsideDhaka")}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_90px] gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                {t("product")} *
              </label>
              <select
                required
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">{t("selectProduct")}</option>
                {productsData?.data.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                {t("quantity")} *
              </label>
              <input
                type="number"
                min={1}
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              {t("orderNote")}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("orderNotePlaceholder")}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={orderMutations.create.isPending || loadingProducts}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {orderMutations.create.isPending ? t("saving") : t("submitOrder")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
