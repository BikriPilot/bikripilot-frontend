import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ChannelsPage from "@/app/dashboard/(settings)/channels/page";

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
  useQuery: ({ queryKey }: { queryKey: string[] }) =>
    queryKey[0] === "channels"
      ? {
          data: [{ id: "channel", name: "Page", status: "NEEDS_RECONNECT" }],
          refetch: vi.fn(),
        }
      : {},
}));

describe("Facebook Page reconnection", () => {
  afterEach(() => {
    cleanup();
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
