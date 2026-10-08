import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import en from "../messages/en.json";
import { PlanPicker } from "@/components/billing/PlanPicker";
import type { PublicPlan } from "@/types/plan";

const plan: PublicPlan = {
  id: "plan-1",
  key: "starter",
  nameEn: "Starter",
  nameBn: "স্টার্টার",
  descriptionEn: "A plan for growing shops.",
  descriptionBn: "বাড়তে থাকা শপের জন্য প্ল্যান।",
  priceMonthlyPaisa: 99_000,
  priceYearlyPaisa: 990_000,
  trialDays: 0,
  isHighlighted: false,
  sortOrder: 1,
  features: [
    {
      key: "orders_per_month",
      type: "LIMIT",
      group: "orders",
      nameEn: "Orders per month",
      nameBn: "মাসে অর্ডার",
      enabled: true,
      unlimited: false,
      limit: 1000,
    },
  ],
};

describe("billing plan selection", () => {
  it("shows cycle-specific prices and returns the selected plan", () => {
    const onChoose = vi.fn();
    function Harness() {
      const [cycle, setCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
      return (
        <PlanPicker
          plans={[plan]}
          cycle={cycle}
          currentPlanKey="free"
          currentCycle="MONTHLY"
          onCycleChange={setCycle}
          onChoose={onChoose}
        />
      );
    }
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <Harness />
      </NextIntlClientProvider>,
    );

    expect(screen.getByText("৳990")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Yearly" }));
    expect(screen.getByText("৳9,900")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Review plan" }));

    expect(onChoose).toHaveBeenCalledWith(plan);
  });
});
