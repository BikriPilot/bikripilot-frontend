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
