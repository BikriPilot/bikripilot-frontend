import { beforeEach, describe, expect, it, vi } from "vitest";

const { get, post } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock("@/lib/api/client", () => ({ api: { get, post } }));

import { billingApi } from "@/lib/api/billing.api";

describe("billingApi", () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
  });

  it("loads the public billing catalog from the contracted endpoints", async () => {
    get
      .mockResolvedValueOnce({ data: { data: [] } })
      .mockResolvedValueOnce({
        data: { data: { providers: [], manual: null } },
      });

    await expect(billingApi.plans()).resolves.toEqual([]);
    await expect(billingApi.providers()).resolves.toEqual({
      providers: [],
      manual: null,
    });
    expect(get).toHaveBeenNthCalledWith(1, "/public/plans");
    expect(get).toHaveBeenNthCalledWith(2, "/public/billing-providers");
  });

  it("uses the shop billing paths and exact selection payloads", async () => {
    post.mockResolvedValue({ data: { data: { kind: "NEW" } } });
    const input = { planKey: "starter", billingCycle: "MONTHLY" as const };

    await billingApi.preview("shop-1", input);
    await billingApi.checkout("shop-1", { ...input, provider: "MANUAL" });
    await billingApi.setAutoRenew("shop-1", false);

    expect(post).toHaveBeenNthCalledWith(
      1,
      "/shops/shop-1/billing/preview",
      input,
    );
    expect(post).toHaveBeenNthCalledWith(2, "/shops/shop-1/billing/checkout", {
      ...input,
      provider: "MANUAL",
    });
    expect(post).toHaveBeenNthCalledWith(
      3,
      "/shops/shop-1/billing/auto-renew",
      { autoRenew: false },
    );
  });
});
