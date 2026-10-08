import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TeamPage from "@/app/dashboard/(settings)/team/page";

const mocks = vi.hoisted(() => ({
  updateMember: vi.fn(),
  removeMember: vi.fn(),
  revokeInvitation: vi.fn(),
  refetch: vi.fn(),
  role: "OWNER",
}));
vi.mock("@/lib/api/shops.api", () => ({ shopsApi: mocks }));
vi.mock("@/hooks/useCurrentShop", () => ({
  useCurrentShop: () => ({ shopId: "shop", can: () => true, role: mocks.role }),
}));
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("@tanstack/react-query", () => ({
  useQuery: ({ queryKey }: { queryKey: string[] }) => ({
    isPending: false,
    isError: false,
    refetch: mocks.refetch,
    data:
      queryKey[0] === "members"
        ? [
            {
              id: "owner",
              name: "Owner",
              email: "owner@example.com",
              role: "OWNER",
            },
            {
              id: "agent",
              name: "Agent",
              email: "agent@example.com",
              role: "AGENT",
            },
            {
              id: "manager",
              name: "Manager",
              email: "manager@example.com",
              role: "MANAGER",
            },
          ]
        : [
            {
              id: "invite",
              email: "invite@example.com",
              role: "AGENT",
              status: "PENDING",
            },
          ],
  }),
}));

describe("team controls", () => {
  beforeEach(() => {
    cleanup();
    mocks.role = "OWNER";
    for (const method of [
      mocks.updateMember,
      mocks.removeMember,
      mocks.revokeInvitation,
      mocks.refetch,
    ]) {
      method.mockReset();
      method.mockResolvedValue({});
    }
  });
  it("wires role changes, confirmed removal and invitation revocation", async () => {
    render(<TeamPage />);
    fireEvent.change(screen.getByRole("combobox", { name: "role: Agent" }), {
      target: { value: "VIEWER" },
    });
    await waitFor(() =>
      expect(mocks.updateMember).toHaveBeenCalledWith(
        "shop",
        "agent",
        "VIEWER",
      ),
    );
    fireEvent.click(screen.getAllByRole("button", { name: "removeMember" })[0]);
    expect(mocks.removeMember).not.toHaveBeenCalled();
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "removeMember",
      }),
    );
    await waitFor(() =>
      expect(mocks.removeMember).toHaveBeenCalledWith("shop", "agent"),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    fireEvent.click(screen.getByRole("button", { name: "revokeInvite" }));
    await waitFor(() =>
      expect(mocks.revokeInvitation).toHaveBeenCalledWith("shop", "invite"),
    );
  });
  it("does not let managers edit other managers or assign manager", () => {
    mocks.role = "MANAGER";
    render(<TeamPage />);
    expect(
      screen.queryByRole("combobox", { name: "role: Manager" }),
    ).toBeNull();
    expect(
      within(screen.getByRole("combobox", { name: "role: Agent" })).queryByRole(
        "option",
        { name: "MANAGER" },
      ),
    ).toBeNull();
  });
});
