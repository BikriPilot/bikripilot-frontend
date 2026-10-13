import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PublicNavbarClient } from "@/components/landing/PublicNavbarClient";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  user: null as { platformRole: string } | null,
  isBootstrapping: false,
  logout: vi.fn().mockResolvedValue(null),
  clear: vi.fn(),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: mocks.user, isBootstrapping: mocks.isBootstrapping }),
}));

vi.mock("@/stores/authStore", () => ({
  useAuthStore: (selector: (state: { clear: () => void }) => unknown) =>
    selector({ clear: mocks.clear }),
}));

vi.mock("@/lib/api/auth.api", () => ({
  authApi: { logout: mocks.logout },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
  usePathname: () => "/",
}));

vi.mock("@/components/common/LanguageSwitcher", () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher" />,
}));

vi.mock("@/components/common/ThemeToggle", () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

vi.mock("@/components/common/Logo", () => ({
  Logo: () => <div data-testid="logo" />,
}));

const translations = {
  navFeatures: "Features",
  navHow: "How it works",
  navPricing: "Pricing",
  navFaq: "FAQ",
  navLogin: "Log in",
  startFree: "Start free",
  startTotallyFree: "Start totally free",
  supportBtn: "Support",
  navResources: "Resources",
  navTrackOrders: "Track orders",
  navContact: "Contact",
  navDataDeletion: "Data deletion",
  navDashboard: "Dashboard",
  navLogout: "Log out",
};

describe("PublicNavbarClient", () => {
  beforeEach(() => {
    cleanup();
    mocks.refresh.mockClear();
    mocks.logout.mockClear();
    mocks.clear.mockClear();
    mocks.user = null;
    mocks.isBootstrapping = false;
  });

  it("renders login and register buttons when guest", () => {
    render(<PublicNavbarClient t={translations} />);
    expect(screen.getAllByText("Log in").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Start free").length).toBeGreaterThan(0);
    expect(screen.queryByText("Dashboard")).toBeNull();
  });

  it("renders Dashboard and Logout icon when seller is logged in", () => {
    mocks.user = { platformRole: "USER" };
    render(<PublicNavbarClient t={translations} />);
    expect(screen.queryByText("Log in")).toBeNull();
    expect(screen.queryByText("Start free")).toBeNull();

    const dashboardLinks = screen.getAllByRole("link", { name: /Dashboard/i });
    expect(dashboardLinks[0].getAttribute("href")).toBe("/dashboard");

    const logoutButtons = screen.getAllByRole("button", { name: /Log out/i });
    expect(logoutButtons.length).toBeGreaterThan(0);
  });

  it("renders Dashboard link to /admin when admin is logged in", () => {
    mocks.user = { platformRole: "SUPER_ADMIN" };
    render(<PublicNavbarClient t={translations} />);
    expect(screen.queryByText("Log in")).toBeNull();

    const dashboardLinks = screen.getAllByRole("link", { name: /Dashboard/i });
    expect(dashboardLinks[0].getAttribute("href")).toBe("/admin");
  });

  it("handles logout click", async () => {
    mocks.user = { platformRole: "USER" };
    render(<PublicNavbarClient t={translations} />);
    const logoutBtn = screen.getAllByRole("button", { name: /Log out/i })[0];
    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(mocks.logout).toHaveBeenCalled();
      expect(mocks.clear).toHaveBeenCalled();
      expect(mocks.refresh).toHaveBeenCalled();
    });
  });
});
