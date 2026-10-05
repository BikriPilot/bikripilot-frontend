export const LOCALES = ["bn", "en"] as const;
export const DEFAULT_LOCALE = "bn";
export type LocaleValue = (typeof LOCALES)[number];
export const ORDER_STATUSES = [
  "DRAFT",
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;
export type OrderStatusValue = (typeof ORDER_STATUSES)[number];
