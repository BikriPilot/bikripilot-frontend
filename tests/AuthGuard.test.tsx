import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthGuard } from "@/components/layout/AuthGuard";

const mocks = vi.hoisted(() => ({
  pathname: "/dashboard",
  replace: vi.fn(),
  user: { memberships: [], twoFactorSetupRequired: true },
}));
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: mocks.user, isBootstrapping: false }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
  usePathname: () => mocks.pathname,
}));
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));

describe("admin profile access", () => {
  beforeEach(() => {
    cleanup();
    mocks.replace.mockClear();
  });
  it("prioritizes required 2FA setup over missing shop membership", async () => {
    mocks.pathname = "/dashboard";
    render(
      <AuthGuard>
        <div>Profile content</div>
      </AuthGuard>,
    );
    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith(
        "/dashboard/profile?setup2fa=1",
      ),
    );
    expect(mocks.replace).not.toHaveBeenCalledWith("/onboarding");
  });
  it("allows the security profile without a shop or a redirect loop", () => {
    mocks.pathname = "/dashboard/profile";
    render(
      <AuthGuard>
        <div>Profile content</div>
      </AuthGuard>,
    );
    expect(screen.getByText("Profile content")).toBeTruthy();
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});
