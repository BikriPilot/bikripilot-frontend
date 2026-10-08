import type { DeliveryZoneValue } from './enums';

// 64 districts of Bangladesh (English names; Bangla labels come from i18n "districts.<name>").
export const BD_DISTRICTS = [
  'Bagerhat', 'Bandarban', 'Barguna', 'Barishal', 'Bhola', 'Bogura', 'Brahmanbaria', 'Chandpur',
  'Chapai Nawabganj', 'Chattogram', 'Chuadanga', "Cox's Bazar", 'Cumilla', 'Dhaka', 'Dinajpur', 'Faridpur',
  'Feni', 'Gaibandha', 'Gazipur', 'Gopalganj', 'Habiganj', 'Jamalpur', 'Jashore', 'Jhalokathi',
  'Jhenaidah', 'Joypurhat', 'Khagrachhari', 'Khulna', 'Kishoreganj', 'Kurigram', 'Kushtia', 'Lakshmipur',
  'Lalmonirhat', 'Madaripur', 'Magura', 'Manikganj', 'Meherpur', 'Moulvibazar', 'Munshiganj', 'Mymensingh',
  'Naogaon', 'Narail', 'Narayanganj', 'Narsingdi', 'Natore', 'Netrokona', 'Nilphamari', 'Noakhali',
  'Pabna', 'Panchagarh', 'Patuakhali', 'Pirojpur', 'Rajbari', 'Rajshahi', 'Rangamati', 'Rangpur',
  'Satkhira', 'Shariatpur', 'Sherpur', 'Sirajganj', 'Sunamganj', 'Sylhet', 'Tangail', 'Thakurgaon',
] as const;

export type BdDistrict = (typeof BD_DISTRICTS)[number];

export const SUB_DHAKA_DISTRICTS: BdDistrict[] = ['Gazipur', 'Narayanganj'];

// Suggestion only — the seller can always change the zone on the order.
export const suggestDeliveryZone = (district?: string | null): DeliveryZoneValue => {
  if (!district) return 'INSIDE_DHAKA';
  if (district === 'Dhaka') return 'INSIDE_DHAKA';
  if ((SUB_DHAKA_DISTRICTS as string[]).includes(district)) return 'SUB_DHAKA';
  return 'OUTSIDE_DHAKA';
};
