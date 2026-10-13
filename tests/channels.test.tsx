import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ChannelsPage from "@/app/dashboard/(settings)/channels/page";

import { useAuthStore } from "@/stores/authStore";

const mocks = vi.hoisted(() => ({
  oauthUrl: vi.fn().mockRejectedValue(new Error("OAuth navigation test")),
  resubscribe: vi.fn(),
}));
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@/hooks/useCurrentShop", () => ({
  useCurrentShop: () => ({ shopId: "shop" }),
}));
vi.mock("@/lib/api/channels.api", () => ({ channelsApi: mocks }));
vi.mock("@tanstack/react-query", () => ({
  useQuery: ({ queryKey }: { queryKey: string[] }) => {
    if (queryKey[0] === "channels") {
      return {
        data: [{ id: "channel", name: "Page", status: "NEEDS_RECONNECT" }],
        refetch: vi.fn(),
      };
    }
    if (queryKey[0] === "shop") {
      return {
        data: {
          id: "shop",
          name: "Shop Name",
          logoUrl: "https://example.com/logo.png",
          facebookPageUrl: "https://facebook.com/page",
        },
      };
    }
    return {};
  },
}));

describe("Facebook Page reconnection", () => {
  beforeEach(() => {
    useAuthStore.getState().setUser({
      id: "user-1",
      name: "Seller",
      phone: "01711111111",
      email: "seller@example.com",
      district: "Dhaka",
      locale: "bn",
      platformRole: "USER",
      emailVerified: true,
      createdAt: "2026-10-08T00:00:00Z",
      twoFactorEnabled: false,
      twoFactorSetupRequired: false,
      memberships: [],
      impersonation: null,
    });
  });
  afterEach(() => {
    cleanup();
    useAuthStore.getState().clear();
    vi.clearAllMocks();
  });
  it("requests fresh OAuth authorization instead of reusing a revoked token", async () => {
    render(<ChannelsPage />);
    expect(screen.getByRole("complementary", { name: "title" })).toBeTruthy();
    expect(screen.getByText("meta")).toBeTruthy();
    expect(screen.getByText("serverAccess")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "reconnect" }));
    await waitFor(() => expect(mocks.oauthUrl).toHaveBeenCalledWith("shop"));
    expect(mocks.resubscribe).not.toHaveBeenCalled();
  });
});
