import type { MembershipDTO, ShopRole } from "./auth";
export type { MembershipDTO, ShopRole };
export interface ShopDTO {
  id: string;
  name: string;
  slug: string;
  status: "ACTIVE" | "SUSPENDED";
  businessCategory: string | null;
  websiteUrl: string | null;
  facebookPageUrl: string | null;
  district: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  timezone: string;
  currency: string;
  onboardingCompletedAt: string | null;
  onboardingDismissedAt: string | null;
  createdAt: string;
}
export interface ShopSettingsDTO {
  orderPrefix: string;
  deliveryChargeInsideDhakaPaisa: number;
  deliveryChargeSubDhakaPaisa: number;
  deliveryChargeOutsideDhakaPaisa: number;
  freeDeliveryMinPaisa: number | null;
  allowOversell: boolean;
  duplicateWindowHours: number;
  defaultPaymentMethod: string;
  defaultCourierConnectionId: string | null;
  lowStockThreshold: number;
  riskMediumThreshold: number;
  riskHighThreshold: number;
  riskAutoCheckOnConfirm: boolean;
  invoiceNote: string | null;
  tagadaTemplate: string | null;
  publicTrackingEnabled: boolean;
  advanceMode: "NONE" | "DELIVERY_CHARGE" | "PARTIAL";
  partialAdvancePaisa: number;
  bkashNumber?: string | null;
  bkashType?: "PERSONAL" | "MERCHANT" | null;
  nagadNumber?: string | null;
  nagadType?: "PERSONAL" | "MERCHANT" | null;
  rocketNumber?: string | null;
  rocketType?: "PERSONAL" | "MERCHANT" | null;
  hasFraudbdKey?: boolean;
  fraudbdApiKeyMasked?: string | null;
  fraudbdApiKey?: string | null;
}
export type OnboardingStepKey =
  | "business_info"
  | "delivery_charges"
  | "ai_business_info"
  | "connect_page"
  | "add_product"
  | "connect_courier";
export interface SetupChecklistItem {
  key: string;
  done: boolean;
  href: string;
}

export interface OnboardingDTO {
  completed: boolean;
  dismissed: boolean;
  steps: { key: OnboardingStepKey; done: boolean }[];
  setupChecklist?: SetupChecklistItem[];
}
export interface MemberDTO {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: ShopRole;
  joinedAt: string;
  isYou: boolean;
}
export interface InvitationDTO {
  id: string;
  email: string;
  role: ShopRole;
  status: string;
  expiresAt: string;
  createdAt: string;
}
export interface InvitePreviewDTO {
  shopName: string;
  role: ShopRole;
  email: string;
  status: string;
  expiresAt: string;
}
