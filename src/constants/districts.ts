import type { DeliveryZoneValue } from "./enums";

export const BD_DISTRICTS = [
  "Bagerhat",
  "Barishal",
  "Chattogram",
  "Dhaka",
  "Gazipur",
  "Khulna",
  "Rajshahi",
  "Rangpur",
  "Sylhet",
] as const;

export type BdDistrict = (typeof BD_DISTRICTS)[number];

export function suggestDeliveryZone(district: string): DeliveryZoneValue {
  const normalized = district.trim().toLowerCase();
  if (normalized === "dhaka") return "INSIDE_DHAKA";
  if (normalized === "gazipur" || normalized === "narayanganj") return "SUB_DHAKA";
  return "OUTSIDE_DHAKA";
}
