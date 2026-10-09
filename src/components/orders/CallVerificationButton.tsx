"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { ordersApi } from "@/lib/api/orders.api";
import type { OrderListItemDTO } from "@/types/order";

export function CallVerificationButton({
  order,
}: {
  order: Pick<OrderListItemDTO, "id" | "status" | "callVerifiedAt">;
}) {
  const t = useTranslations("orders.review");
  const { shopId, can } = useCurrentShop();
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: () =>
      ordersApi.callVerification(shopId!, order.id, !order.callVerifiedAt),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["orders", shopId] });
    },
  });
  if (
    !can("order.status") ||
    !["PENDING", "CONFIRMED", "PACKED"].includes(order.status)
  )
    return null;
  return (
    <button
      type="button"
      aria-pressed={Boolean(order.callVerifiedAt)}
      title={order.callVerifiedAt ? t("undoCall") : t("callHint")}
      disabled={mutation.isPending}
      className={`inline-flex min-h-11 w-36 justify-center items-center gap-2 rounded-lg border px-3 text-sm ${order.callVerifiedAt ? "border-success bg-success-soft text-success" : ""}`}
      onClick={async () => {
        try {
          await mutation.mutateAsync();
        } catch {
          toast.error(t("callError"));
        }
      }}
    >
      {order.callVerifiedAt ? <Check size={16} /> : <Phone size={16} />}
      {order.callVerifiedAt ? t("called") : t("call")}
    </button>
  );
}
