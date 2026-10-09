import type { OrderStatus } from "@/types/order";

export const getOrderListStatus = (
  status: string | null,
  reviewQueue: boolean,
) =>
  status === "ALL"
    ? undefined
    : status || (reviewQueue ? undefined : "CONFIRMED");

export const getOrderActions = (
  status: OrderStatus,
  allowed: OrderStatus[],
  hasShipment: boolean,
) =>
  hasShipment
    ? []
    : allowed.filter(
        (next) =>
          next !== status &&
          next !== "PENDING" &&
          !(status === "PACKED" && next === "CONFIRMED"),
      );
