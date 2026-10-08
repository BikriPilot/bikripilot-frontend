import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/stores/authStore";
import { useAuth } from "@/hooks/useAuth";
import type { AuthResultDTO } from "@/types/auth";

const mocks = vi.hoisted(() => ({ refresh: vi.fn(), replace: vi.fn() }));
vi.mock("@/lib/api/auth.api", () => ({ authApi: { refresh: mocks.refresh } }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

describe("authentication bootstrap", () => {
  beforeEach(() => {
    useAuthStore.getState().clear();
    mocks.refresh.mockReset();
    mocks.replace.mockClear();
  });

  it("shares one refresh across simultaneous mounted consumers", async () => {
    let resolveRefresh!: (result: AuthResultDTO) => void;
    mocks.refresh.mockReturnValue(
      new Promise<AuthResultDTO>((resolve) => {
        resolveRefresh = resolve;
      }),
    );
    const first = renderHook(() => useAuth());
    const second = renderHook(() => useAuth());
    expect(mocks.refresh).toHaveBeenCalledOnce();
    await act(async () =>
      resolveRefresh({
        accessToken: "token",
        user: {
          id: "user",
          name: "Seller",
          email: "seller@example.com",
          phone: null,
          locale: "en",
          platformRole: "USER",
          emailVerified: true,
          createdAt: "2026-10-08T00:00:00Z",
          twoFactorEnabled: false,
          twoFactorSetupRequired: false,
          memberships: [],
          impersonation: null,
        },
      }),
    );
    await waitFor(() =>
      expect(first.result.current.isBootstrapping).toBe(false),
    );
    expect(second.result.current.isBootstrapping).toBe(false);
    expect(second.result.current.accessToken).toBe("token");
  });
});
