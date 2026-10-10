"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, Truck } from "lucide-react";
import { ShipmentStatusBadge } from "@/components/couriers/ShipmentStatusBadge";
import { RiskBadge } from "@/components/risk/RiskBadge";
import { formatMoney } from "@/lib/money";
import type { OrderListItemDTO } from "@/types/order";
import { CallVerificationButton } from "./CallVerificationButton";
import { OrderConversationLink } from "./OrderConversationLink";

interface OrderCardProps {
  item: OrderListItemDTO;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  onBookCourier?: (order: OrderListItemDTO) => void;
}

export function OrderCard({
  item,
  selected = false,
  onToggleSelect,
}: OrderCardProps) {
  const t = useTranslations("orders");

  return (
    <div
      className={`rounded-xl border bg-card p-4 transition-colors ${
        selected ? "border-primary bg-primary/5" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onToggleSelect && (
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect(item.id)}
              className="size-4 rounded-sm border-primary text-primary accent-primary"
            />
          )}
          <Link
            href={`/dashboard/orders/${item.id}`}
            className="font-semibold text-primary hover:underline"
          >
            {item.orderNumber}
          </Link>
        </div>
        <span className="rounded-full bg-muted px-2 py-1 text-xs">
          {t(`status.${item.status}`)}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="font-medium text-sm">{item.customerName}</p>
            {item.riskLevel && <RiskBadge level={item.riskLevel} size="sm" />}
          </div>
          <p className="text-xs text-muted-foreground">{item.customerPhone}</p>
        </div>
        <p className="font-semibold text-sm">{formatMoney(item.totalPaisa)}</p>
      </div>

      {item.shipment && (
        <div className="mt-2.5 flex items-center justify-between border-t pt-2 text-xs">
          <span className="inline-flex items-center gap-1 text-muted-foreground font-mono">
            <Truck size={12} />
            {item.shipment.trackingCode || item.shipment.provider}
          </span>
          <ShipmentStatusBadge status={item.shipment.status} />
        </div>
      )}

      <p className="mt-3 break-words text-sm">{item.firstItemName || "-"}</p>
      <p className="text-sm text-muted-foreground">
        {t("advance.remaining")}: {formatMoney(item.codAmountPaisa)}
      </p>
      <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
        <OrderConversationLink conversationId={item.conversationId} />
        <CallVerificationButton order={item} />
        <Link
          href={`/dashboard/orders/${item.id}`}
          className="inline-flex min-h-11 w-36 justify-center items-center gap-2 rounded-lg bg-primary px-3 text-primary-foreground"
        >
          {t("workflow.update")}
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
