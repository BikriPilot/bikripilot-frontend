import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useAuthStore } from "@/stores/authStore";
import type { MeDTO } from "@/types/auth";

const mocks = vi.hoisted(() => ({ updateMe: vi.fn(), refresh: vi.fn() }));
vi.mock("@/lib/api/auth.api", () => ({
  authApi: { updateMe: mocks.updateMe },
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));
vi.mock("next-intl", () => ({
  useLocale: () => "bn",
  useTranslations: () => (key: string) => key,
}));

const user: MeDTO = {
  id: "seller",
  name: "Seller",
  email: "seller@example.com",
  phone: null,
  district: null,
  locale: "bn",
  platformRole: "USER",
  emailVerified: true,
  createdAt: "2026-10-08T00:00:00Z",
  twoFactorEnabled: false,
  twoFactorSetupRequired: false,
  memberships: [],
  impersonation: null,
};

describe("language preference", () => {
  beforeEach(() => {
    cleanup();
    useAuthStore.getState().clear();
    mocks.updateMe.mockReset();
    mocks.refresh.mockClear();
  });
  it("persists the signed-in seller preference without losing authentication", async () => {
    useAuthStore.getState().setAuth("token", user);
    mocks.updateMe.mockResolvedValue({ ...user, locale: "en" });
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByRole("button", { name: "English" }));
    await waitFor(() =>
      expect(useAuthStore.getState().user?.locale).toBe("en"),
    );
    expect(mocks.updateMe).toHaveBeenCalledWith({ locale: "en" });
    expect(useAuthStore.getState().accessToken).toBe("token");
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });
  it("does not call the profile API for anonymous visitors", () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByRole("button", { name: "English" }));
    expect(mocks.updateMe).not.toHaveBeenCalled();
  });
});
