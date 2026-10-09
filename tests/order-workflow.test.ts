import { describe, expect, it } from "vitest";
import {
  getOrderActions,
  getOrderListStatus,
} from "@/components/orders/order.workflow";
import { ORDER_TRANSITIONS } from "@/constants/orderStatus";

describe("seller order workflow", () => {
  it("defaults Orders to confirmed and preserves explicit filters", () => {
    expect(getOrderListStatus(null, false)).toBe("CONFIRMED");
    expect(getOrderListStatus("ALL", false)).toBeUndefined();
    expect(getOrderListStatus("RETURNED", false)).toBe("RETURNED");
    expect(getOrderListStatus(null, true)).toBeUndefined();
  });
  it("separates current state and future actions with a manual fallback only without shipments", () => {
    expect(getOrderActions("DRAFT", ORDER_TRANSITIONS.DRAFT, false)).toEqual([
      "CONFIRMED",
      "CANCELLED",
    ]);
    expect(
      getOrderActions("PENDING", ORDER_TRANSITIONS.PENDING, false),
    ).toEqual(["CONFIRMED", "CANCELLED"]);
    expect(
      getOrderActions("CONFIRMED", ORDER_TRANSITIONS.CONFIRMED, false),
    ).toEqual(["PACKED", "SHIPPED", "CANCELLED"]);
    expect(getOrderActions("PACKED", ORDER_TRANSITIONS.PACKED, false)).toEqual([
      "SHIPPED",
      "CANCELLED",
    ]);
    expect(getOrderActions("SHIPPED", ORDER_TRANSITIONS.SHIPPED, true)).toEqual(
      [],
    );
    expect(
      getOrderActions("SHIPPED", ORDER_TRANSITIONS.SHIPPED, false),
    ).toContain("DELIVERED");
    expect(
      getOrderActions("CANCELLED", ORDER_TRANSITIONS.CANCELLED, false),
    ).toEqual([]);
  });
});
