import type { OrderStatusValue } from './enums';

// Allowed transitions for USERS (and the system). See 12-business-rules.md §2.
export const ORDER_TRANSITIONS: Record<OrderStatusValue, OrderStatusValue[]> = {
  DRAFT: ['PENDING', 'CONFIRMED', 'CANCELLED'],
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PACKED', 'SHIPPED', 'CANCELLED'],
  PACKED: ['CONFIRMED', 'SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'PARTIALLY_DELIVERED', 'RETURNED'],
  DELIVERED: ['RETURNED'],
  PARTIALLY_DELIVERED: [],
  RETURNED: [],
  CANCELLED: [],
};

// Extra transitions only the system may make (e.g. courier shipment cancelled before pickup).
export const SYSTEM_ONLY_TRANSITIONS: Array<[OrderStatusValue, OrderStatusValue]> = [['SHIPPED', 'PACKED']];

export const ORDER_EDITABLE_STATUSES: OrderStatusValue[] = ['DRAFT', 'PENDING', 'CONFIRMED', 'PACKED'];
export const ORDER_TERMINAL_STATUSES: OrderStatusValue[] = ['PARTIALLY_DELIVERED', 'RETURNED', 'CANCELLED'];
export const ORDER_BOOKABLE_STATUSES: OrderStatusValue[] = ['CONFIRMED', 'PACKED'];
// Statuses in which stock is considered taken from inventory.
export const ORDER_STOCK_HELD_STATUSES: OrderStatusValue[] = ['CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'PARTIALLY_DELIVERED'];
// Statuses counted as "active pipeline" on dashboards.
export const ORDER_OPEN_STATUSES: OrderStatusValue[] = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED'];

export const canTransition = (from: OrderStatusValue, to: OrderStatusValue, bySystem = false): boolean =>
  ORDER_TRANSITIONS[from].includes(to) ||
  (bySystem && SYSTEM_ONLY_TRANSITIONS.some(([f, t]) => f === from && t === to));
