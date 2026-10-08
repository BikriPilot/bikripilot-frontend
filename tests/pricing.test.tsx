import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PricingComparison } from "@/components/landing/PricingComparison";
import type { PublicPlan } from "@/types/plan";

vi.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => (key: string) => key,
}));

describe("public pricing accuracy", () => {
  it("preserves paisa prices and never advertises disabled benefits", () => {
    const plan: PublicPlan = {
      id: "plan",
      key: "pilot",
      nameEn: "Pilot",
      nameBn: null,
      descriptionEn: null,
      descriptionBn: null,
      priceMonthlyPaisa: 99050,
      priceYearlyPaisa: 990000,
      trialDays: 0,
      isHighlighted: false,
      sortOrder: 0,
      features: [
        {
          key: "orders_per_month",
          type: "LIMIT",
          group: "orders",
          nameEn: "Orders",
          nameBn: null,
          enabled: false,
          unlimited: true,
          limit: 100,
        },
      ],
    };
    render(<PricingComparison plans={[plan]} />);
    expect(screen.getByText("৳990.50")).toBeTruthy();
    expect(screen.queryByText("unlimited")).toBeNull();
    expect(screen.queryByText("100")).toBeNull();
    expect(screen.getByLabelText("notIncluded")).toBeTruthy();
  });
});
