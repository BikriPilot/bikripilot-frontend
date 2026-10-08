import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  push: vi.fn(),
  allowed: true,
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("@/hooks/useCurrentShop", () => ({
  useCurrentShop: () => ({ can: () => mocks.allowed }),
}));
vi.mock("@/hooks/queries/useCustomers", () => ({
  useCustomerMutations: () => ({ create: { mutateAsync: mocks.create } }),
}));
import { CustomerCreate } from "@/components/customers/CustomerCreate";

describe("customer creation", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    mocks.allowed = true;
  });
  it("creates a customer without optional email and preserves tags", async () => {
    mocks.create.mockResolvedValue({ id: "customer" });
    render(<CustomerCreate />);
    fireEvent.change(screen.getByRole("textbox", { name: "name" }), {
      target: { value: "Test customer" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "tags" }), {
      target: { value: "repeat, wholesale" },
    });
    fireEvent.click(screen.getByRole("button", { name: "save" }));
    await waitFor(() =>
      expect(mocks.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Test customer",
          email: null,
          phone: null,
          tags: ["repeat", "wholesale"],
        }),
      ),
    );
    expect(mocks.push).toHaveBeenCalledWith("/dashboard/customers/customer");
  });
  it("prevents creation without write permission", () => {
    mocks.allowed = false;
    render(<CustomerCreate />);
    expect(screen.getByRole("button", { name: "save" })).toBeDisabled();
  });
});
