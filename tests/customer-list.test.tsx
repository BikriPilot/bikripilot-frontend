import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ query: vi.fn(), writable: false }));
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("@/hooks/useCurrentShop", () => ({
  useCurrentShop: () => ({ shopId: "shop", can: () => mocks.writable }),
}));
vi.mock("@/hooks/useEntitlements", () => ({
  useEntitlements: () => ({ useFeature: () => false }),
}));
vi.mock("@/hooks/queries/useCustomers", () => ({
  useCustomers: mocks.query,
  useCustomerMutations: () => ({}),
}));
import { CustomerList } from "@/components/customers/CustomerList";

describe("customer list controls", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    mocks.writable = false;
  });
  it("hides writes and passes filter and pagination values to the API query", () => {
    mocks.query.mockReturnValue({
      data: { data: [], meta: { totalPages: 2 } },
    });
    render(<CustomerList />);
    expect(screen.queryByRole("link", { name: "add" })).toBeNull();
    expect(screen.queryByRole("button", { name: "export" })).toBeNull();
    fireEvent.change(screen.getByRole("combobox", { name: "status" }), {
      target: { value: "true" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "tagFilter" }), {
      target: { value: "repeat" },
    });
    fireEvent.click(screen.getByRole("button", { name: "next" }));
    expect(mocks.query).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2, blocked: true, tag: "repeat" }),
    );
  });
});
