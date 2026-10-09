import { describe, expect, it } from "vitest";
import { FEATURE_LIST } from "@/constants/features";
import { PERMISSIONS, ROLE_PERMISSIONS } from "@/constants/permissions";
import { canTransition } from "@/constants/orderStatus";
import { NAV_SECTIONS, getActiveSection } from "@/constants/navigation";
import en from "../messages/en.json";
import bn from "../messages/bn.json";
import { PAYMENT_METHODS } from "@/constants/enums";

describe("shared business registries", () => {
  it("selects the most specific sidebar section", () => {
    expect(getActiveSection("/dashboard/ai/settings")?.key).toBe("ai");
    expect(getActiveSection("/dashboard/settings/hisab")?.key).toBe("settings");
    expect(getActiveSection("/dashboard/orders/order-id")?.key).toBe("orders");
    expect(getActiveSection("/dashboard/ai-orders")?.key).toBe("orders");
  });
  it("has bilingual payment method labels", () => {
    for (const method of PAYMENT_METHODS) {
      expect(en.enums.PaymentMethod[method]).toBeTruthy();
      expect(bn.enums.PaymentMethod[method]).toBeTruthy();
    }
  });
  it("has bilingual labels for every navigation entry and quick command", () => {
    const keys = NAV_SECTIONS.flatMap((section) => [
      section.labelKey,
      ...section.subNav.map((item) => item.labelKey),
    ]);
    keys.push("newOrder", "recordGave", "checkPhone");
    for (const key of keys) {
      expect(
        (en.step8 as Record<string, unknown>)[key],
        `English label ${key}`,
      ).toBeTruthy();
      expect(
        (bn.step8 as Record<string, unknown>)[key],
        `Bangla label ${key}`,
      ).toBeTruthy();
    }
  });
  it("keeps four mobile destinations plus More and uses matching route permissions", () => {
    expect(
      NAV_SECTIONS.filter((section) => section.mobile === "bottom")
        .map((section) => section.key)
        .sort(),
    ).toEqual(["hisab", "home", "inbox", "orders"]);
    expect(
      NAV_SECTIONS.find((section) => section.key === "customers")?.subNav.find(
        (item) => item.key === "risk",
      )?.permission,
    ).toBe("risk.check");
    expect(
      NAV_SECTIONS.find((section) => section.key === "analytics")?.permission,
    ).toBe("analytics.read");
  });
  it("contains all planned features and seller billing permission", () => {
    expect(FEATURE_LIST).toHaveLength(17);
    expect(FEATURE_LIST.map((feature) => feature.key)).toContain(
      "ai_auto_reply",
    );
    expect(FEATURE_LIST.map((feature) => feature.key)).toContain(
      "cod_reconciliation",
    );
    expect(PERMISSIONS.BILLING_MANAGE).toBe("billing.manage");
    expect(ROLE_PERMISSIONS.OWNER).toContain(PERMISSIONS.BILLING_MANAGE);
    expect(ROLE_PERMISSIONS.MANAGER).not.toContain(PERMISSIONS.BILLING_MANAGE);
  });

  it("allows late delivered returns but not terminal partial-delivery returns", () => {
    expect(canTransition("DELIVERED", "RETURNED")).toBe(true);
    expect(canTransition("PARTIALLY_DELIVERED", "RETURNED")).toBe(false);
    expect(canTransition("SHIPPED", "PACKED")).toBe(false);
    expect(canTransition("SHIPPED", "PACKED", true)).toBe(true);
  });
});
