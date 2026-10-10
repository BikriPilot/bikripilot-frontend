import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SOCKET_EVENTS } from "@/constants/socketEvents";

const mocks = vi.hoisted(() => ({
  invalidate: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
}));
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: mocks.invalidate }),
}));
vi.mock("@/lib/socket", () => ({
  connectSocket: () => ({ on: mocks.on, off: mocks.off, emit: mocks.emit }),
  disconnectSocket: mocks.disconnect,
}));
vi.mock("@/stores/authStore", () => ({
  useAuthStore: (select: (state: { accessToken: string }) => unknown) =>
    select({ accessToken: "test" }),
}));
vi.mock("@/stores/shopStore", () => ({
  useShopStore: (select: (state: { currentShopId: string }) => unknown) =>
    select({ currentShopId: "shop" }),
}));
vi.mock("@/hooks/useCurrentShop", () => ({
  useCurrentShop: () => ({ shopId: "shop" }),
}));
import { SocketProvider } from "@/components/layout/SocketProvider";

describe("realtime benefit propagation", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });
  it("rejoins the shop and refreshes missed inbox data after every reconnect", () => {
    const view = render(<SocketProvider />);
    const handlers = mocks.on.mock.calls
      .filter(([event]) => event === "connect")
      .map(([, handler]) => handler);
    expect(handlers).toHaveLength(2);
    for (let connection = 0; connection < 2; connection += 1) {
      handlers.forEach((handler) => handler());
    }
    expect(mocks.emit).toHaveBeenCalledTimes(2);
    expect(mocks.emit).toHaveBeenCalledWith("shop:join", { shopId: "shop" });
    for (const key of ["conversations", "conversation", "messages"]) {
      expect(mocks.invalidate).toHaveBeenCalledWith({
        queryKey: [key, "shop"],
      });
    }
    view.unmount();
    expect(mocks.off).toHaveBeenCalledWith("connect", handlers[1]);
    expect(mocks.emit).toHaveBeenLastCalledWith("shop:leave", {
      shopId: "shop",
    });
  });
  it("refreshes benefit and billing caches on entitlement changes", () => {
    const view = render(<SocketProvider />);
    const handler = mocks.on.mock.calls.find(
      ([event]) => event === SOCKET_EVENTS.ENTITLEMENTS_CHANGED,
    )?.[1];
    expect(handler).toBeTypeOf("function");
    handler();
    expect(mocks.invalidate).toHaveBeenCalledWith({
      queryKey: ["entitlements", "shop"],
    });
    expect(mocks.invalidate).toHaveBeenCalledWith({
      queryKey: ["billing-invoices", "shop"],
    });
    view.unmount();
    expect(mocks.disconnect).toHaveBeenCalled();
  });
});
