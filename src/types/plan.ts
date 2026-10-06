export interface PublicPlanFeature {
  key: string;
  type: "BOOLEAN" | "LIMIT";
  group: string;
  nameEn: string;
  nameBn: string | null;
  enabled: boolean;
  unlimited: boolean;
  limit: number | null;
}

export interface PublicPlan {
  id: string;
  key: string;
  nameEn: string;
  nameBn: string | null;
  descriptionEn: string | null;
  descriptionBn: string | null;
  priceMonthlyPaisa: number;
  priceYearlyPaisa: number;
  trialDays: number;
  isHighlighted: boolean;
  sortOrder: number;
  features: PublicPlanFeature[];
}
