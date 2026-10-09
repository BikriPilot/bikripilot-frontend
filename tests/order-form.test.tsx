import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  create: vi.fn().mockResolvedValue({ id: "draft" }),
  push: vi.fn(),
}));
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("@/hooks/useCurrentShop", () => ({
  useCurrentShop: () => ({ shopId: "shop", can: () => true }),
}));
vi.mock("@/hooks/queries/useOrders", () => ({
  useOrderMutations: () => ({ create: { mutateAsync: mocks.create } }),
}));
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  useMutation: () => ({ mutateAsync: mocks.create }),
  useQuery: ({ queryKey }: { queryKey: string[] }) => ({
    data:
      queryKey[0] === "shopSettings"
        ? { defaultPaymentMethod: "COD" }
        : queryKey.includes("order-picker")
          ? { data: [] }
          : undefined,
    isPending: false,
    isError: false,
  }),
}));
import { OrderForm } from "@/components/orders/OrderForm";
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
describe("order form", () => {
  it("edits without changing lifecycle or verified receipt amounts", async () => {
    render(
      <OrderForm
        initialOrder={
          {
            id: "existing",
            status: "DRAFT",
            customerName: "Buyer",
            customerPhone: "01712345678",
            address: "Dhaka",
            items: [],
            deliveryChargePaisa: 7000,
            advancePaidPaisa: 7000,
            paymentMethod: "COD",
          } as unknown as import("@/types/order").OrderDTO
        }
      />,
    );
    expect(screen.queryByRole("button", { name: "form.draft" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "save" }));
    await waitFor(() => expect(mocks.create).toHaveBeenCalled());
    expect(mocks.create.mock.calls[0][0]).not.toHaveProperty(
      "advancePaidPaisa",
    );
    expect(mocks.create.mock.calls[0][0]).not.toHaveProperty("status");
  });
  it("adds and removes items and saves an incomplete draft rather than pending", async () => {
    render(<OrderForm />);
    fireEvent.click(screen.getByRole("button", { name: "form.addItem" }));
    expect(screen.getAllByRole("combobox", { name: "product" })).toHaveLength(
      2,
    );
    fireEvent.click(screen.getAllByRole("button", { name: "form.remove" })[1]);
    expect(screen.getAllByRole("combobox", { name: "product" })).toHaveLength(
      1,
    );
    fireEvent.click(screen.getByRole("button", { name: "form.draft" }));
    await waitFor(() =>
      expect(mocks.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: "DRAFT", items: [] }),
      ),
    );
  });
});
