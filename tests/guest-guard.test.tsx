import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GuestGuard } from "@/components/layout/GuestGuard";
import { getAuthenticatedRedirect } from "@/lib/safeRedirect";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  user: null as { platformRole: string } | null,
  isBootstrapping: false,
  nextParam: null as string | null,
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: mocks.user, isBootstrapping: mocks.isBootstrapping }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
  useSearchParams: () => ({
    get: (param: string) => (param === "next" ? mocks.nextParam : null),
  }),
}));

describe("GuestGuard", () => {
  beforeEach(() => {
    cleanup();
    mocks.replace.mockClear();
    mocks.user = null;
    mocks.isBootstrapping = false;
    mocks.nextParam = null;
  });

  it("renders children when user is not authenticated", () => {
    mocks.user = null;
    mocks.isBootstrapping = false;
    render(
      <GuestGuard>
        <div>Sign In Form</div>
      </GuestGuard>,
    );
    expect(screen.getByText("Sign In Form")).toBeTruthy();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("redirects authenticated seller to /dashboard", async () => {
    mocks.user = { platformRole: "USER" };
    render(
      <GuestGuard>
        <div>Sign In Form</div>
      </GuestGuard>,
    );
    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith("/dashboard"),
    );
    expect(screen.queryByText("Sign In Form")).toBeNull();
  });

  it("redirects authenticated admin to /admin", async () => {
    mocks.user = { platformRole: "SUPER_ADMIN" };
    render(
      <GuestGuard>
        <div>Sign In Form</div>
      </GuestGuard>,
    );
    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith("/admin"),
    );
    expect(screen.queryByText("Sign In Form")).toBeNull();
  });

  it("redirects to next destination when valid", async () => {
    mocks.user = { platformRole: "USER" };
    mocks.nextParam = "/dashboard/orders";
    render(
      <GuestGuard>
        <div>Sign In Form</div>
      </GuestGuard>,
    );
    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith("/dashboard/orders"),
    );
  });
});

describe("getAuthenticatedRedirect", () => {
  it("defaults to /dashboard for normal user", () => {
    expect(getAuthenticatedRedirect(null, "USER")).toBe("/dashboard");
  });

  it("defaults to /admin for SUPER_ADMIN or SUPPORT", () => {
    expect(getAuthenticatedRedirect(null, "SUPER_ADMIN")).toBe("/admin");
    expect(getAuthenticatedRedirect(null, "SUPPORT")).toBe("/admin");
  });

  it("prevents loops to auth paths", () => {
    expect(getAuthenticatedRedirect("/login", "USER")).toBe("/dashboard");
    expect(getAuthenticatedRedirect("/register", "SUPER_ADMIN")).toBe("/admin");
    expect(getAuthenticatedRedirect("/forgot-password", "USER")).toBe("/dashboard");
  });

  it("preserves safe deep links", () => {
    expect(getAuthenticatedRedirect("/dashboard/inventory", "USER")).toBe(
      "/dashboard/inventory",
    );
  });
});
