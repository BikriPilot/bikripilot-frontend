import { beforeEach, describe, expect, it, vi } from "vitest";
import { AxiosHeaders } from "axios";
import { useUiStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";

const mocks = vi.hoisted(() => ({
  rejected: undefined as undefined | ((error: unknown) => Promise<unknown>),
  post: vi.fn(),
  retry: vi.fn(),
}));

vi.mock("axios", async (importOriginal) => {
  const actual = await importOriginal<typeof import("axios")>();
  const instance = Object.assign(mocks.retry, {
    post: mocks.post,
    interceptors: {
      request: { use: vi.fn() },
      response: {
        use: (_success: unknown, rejected: typeof mocks.rejected) => {
          mocks.rejected = rejected;
        },
      },
    },
  });
  return { ...actual, default: { create: () => instance } };
});

import "@/lib/api/client";

describe("API response interceptor", () => {
  beforeEach(() => {
    mocks.post.mockReset();
    mocks.retry.mockReset();
    useUiStore.getState().closeUpgrade();
    useAuthStore.getState().clear();
  });

  it("keeps server plan-limit details and the envelope message", async () => {
    const error = {
      message: "Axios request failed",
      response: {
        status: 402,
        data: {
          message: "Monthly order limit reached",
          error: {
            code: "PLAN_LIMIT_REACHED",
            details: { feature: "orders_per_month", limit: 100, used: 100 },
          },
        },
      },
    };
    await expect(mocks.rejected!(error)).rejects.toMatchObject({
      message: "Monthly order limit reached",
    });
    expect(useUiStore.getState().upgrade).toEqual({
      feature: "orders_per_month",
      limit: 100,
      used: 100,
    });
  });

  it("refreshes once with the required CSRF header and retries queued requests", async () => {
    mocks.post.mockResolvedValue({
      data: { data: { accessToken: "new-token", user: null } },
    });
    mocks.retry.mockResolvedValue({ data: { ok: true } });
    const failure = () => ({
      message: "Expired",
      response: { status: 401, data: { error: { code: "TOKEN_EXPIRED" } } },
      config: { url: "/shops/shop-1/orders", headers: new AxiosHeaders() },
    });
    await Promise.all([mocks.rejected!(failure()), mocks.rejected!(failure())]);
    expect(mocks.post).toHaveBeenCalledOnce();
    expect(mocks.post).toHaveBeenCalledWith("/auth/refresh", undefined, {
      headers: { "X-Requested-With": "bikrio-web" },
    });
    expect(mocks.retry).toHaveBeenCalledTimes(2);
    expect(useAuthStore.getState().accessToken).toBe("new-token");
  });
});
