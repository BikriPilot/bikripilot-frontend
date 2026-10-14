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
  it("allows a seller with shop membership to browse dashboard freely without 2FA", () => {
    mocks.pathname = "/dashboard/orders";
    mocks.user = {
      memberships: [{ shopId: "shop-1", shopName: "My Shop", role: "OWNER" }],
      twoFactorSetupRequired: false,
      twoFactorEnabled: false,
      platformRole: "USER",
    } as never;
    render(
      <AuthGuard>
        <div>Orders content</div>
      </AuthGuard>,
    );
    expect(screen.getByText("Orders content")).toBeTruthy();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("does not redirect an admin to /admin if they have a shop membership", () => {
    mocks.pathname = "/dashboard";
    mocks.user = {
      memberships: [{ shopId: "shop-1", shopName: "Admin Shop", role: "OWNER" }],
      twoFactorSetupRequired: true,
      twoFactorEnabled: false,
      platformRole: "SUPER_ADMIN",
    } as never;
    render(
      <AuthGuard>
        <div>Dashboard content</div>
      </AuthGuard>,
    );
    expect(screen.getByText("Dashboard content")).toBeTruthy();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("allows onboarding without a shop without triggering a redirect loop", () => {
    mocks.pathname = "/onboarding";
    mocks.user = {
      memberships: [],
      twoFactorSetupRequired: false,
      twoFactorEnabled: false,
      platformRole: "USER",
    } as never;
    render(
      <AuthGuard>
        <div>Onboarding content</div>
      </AuthGuard>,
    );
    expect(screen.getByText("Onboarding content")).toBeTruthy();
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});
