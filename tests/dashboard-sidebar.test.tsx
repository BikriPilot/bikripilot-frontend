import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DashboardShell } from "@/components/layout/DashboardShell";

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ clear: vi.fn() }),
}));
vi.mock("@/hooks/useCurrentShop", () => ({
  useCurrentShop: () => ({ shop: null, can: () => true }),
}));
vi.mock("@/stores/authStore", () => ({
  useAuthStore: (
    select: (state: { user: null; clear: () => void }) => unknown,
  ) => select({ user: null, clear: vi.fn() }),
}));
vi.mock("@/components/common/Logo", () => ({
  Logo: () => <span>Bikrio</span>,
}));
vi.mock("@/components/common/LanguageSwitcher", () => ({
  LanguageSwitcher: () => null,
}));
vi.mock("@/components/layout/NotificationBell", () => ({
  NotificationBell: () => null,
}));
vi.mock("@/components/layout/SectionSubNav", () => ({
  SectionSubNav: () => null,
}));
vi.mock("@/components/layout/CommandMenu", () => ({ CommandMenu: () => null }));
vi.mock("@/components/layout/UpgradeDialog", () => ({
  UpgradeDialog: () => null,
}));

describe("seller sidebar toggle", () => {
  afterEach(cleanup);
  it("hides the sidebar, removes its desktop offset and restores it from the header", () => {
    render(
      <DashboardShell>
        <p>Dashboard content</p>
      </DashboardShell>,
    );
    const sidebar = document.getElementById("seller-sidebar");
    expect(sidebar).toHaveClass("md:block");
    fireEvent.click(screen.getByRole("button", { name: "hideSidebar" }));
    expect(sidebar).not.toHaveClass("md:block");
    expect(document.querySelector("header")).not.toHaveClass("md:ml-60");
    expect(screen.getByRole("button", { name: "showSidebar" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    fireEvent.click(screen.getByRole("button", { name: "showSidebar" }));
    expect(sidebar).toHaveClass("md:block");
    expect(document.querySelector("header")).toHaveClass("md:ml-60");
  });
});
