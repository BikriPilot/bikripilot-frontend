import type { OrderStatusValue } from "./enums";
export const ORDER_TRANSITIONS: Record<OrderStatusValue, OrderStatusValue[]> = {
  DRAFT: ["PENDING", "CONFIRMED", "CANCELLED"],
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PACKED", "SHIPPED", "CANCELLED"],
  PACKED: ["CONFIRMED", "SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "PARTIALLY_DELIVERED", "RETURNED"],
  DELIVERED: [],
  PARTIALLY_DELIVERED: ["RETURNED"],
  RETURNED: [],
  CANCELLED: [],
};
export const canTransition = (from: OrderStatusValue, to: OrderStatusValue) =>
  ORDER_TRANSITIONS[from].includes(to);
