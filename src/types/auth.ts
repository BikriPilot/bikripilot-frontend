export type PlatformRole = "USER" | "SUPPORT" | "SUPER_ADMIN";
export type ShopRole =
  "OWNER" | "MANAGER" | "AGENT" | "FULFILMENT" | "ACCOUNTANT" | "VIEWER";
export type Permission = string;

export interface MembershipDTO {
  shopId: string;
  shopName: string;
  shopSlug: string;
  shopLogoUrl: string | null;
  shopStatus: "ACTIVE" | "SUSPENDED";
  role: ShopRole;
  permissions: Permission[];
}
export interface MeDTO {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  district: string | null;
  address?: string | null;
  postalCode?: string | null;
  locale: "bn" | "en";
  platformRole: PlatformRole;
  emailVerified: boolean;
  createdAt: string;
  twoFactorEnabled: boolean;
  twoFactorSetupRequired: boolean;
  memberships: MembershipDTO[];
  impersonation: { shopId: string; readOnly: true } | null;
}
export interface AuthResultDTO {
  accessToken: string;
  user: MeDTO;
}
export interface TwoFactorChallengeDTO {
  twoFactorRequired: true;
  twoFactorToken: string;
}
export type LoginResultDTO = AuthResultDTO | TwoFactorChallengeDTO;
export interface TwoFactorSetupDTO {
  otpauthUrl: string;
  secretBase32: string;
}
export interface SessionDTO {
  id: string;
  userAgent: string | null;
  ipMasked: string | null;
  createdAt: string;
  current: boolean;
}
