import { describe, expect, it } from "vitest";
import { FEATURE_LIST } from "@/constants/features";
import { PERMISSIONS, ROLE_PERMISSIONS } from "@/constants/permissions";
import { canTransition } from "@/constants/orderStatus";

describe("shared business registries", () => {
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
