export interface PublicConfig {
  platformName: string;
  logoUrl: string | null;
  supportPhone: string | null;
  supportWhatsapp: string | null;
  supportEmail: string | null;
  facebookPageUrl: string | null;
  signupEnabled: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  freeLaunchMode: boolean;
  defaultLocale: "bn" | "en";
  heroVideoUrl: string | null;
  showTestimonials: boolean;
  enabledPaymentProviders: string[];
  enabledCouriers: string[];
  turnstileEnabled: boolean;
  analyticsEnabled: boolean;
}
