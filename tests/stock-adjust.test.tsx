import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ mutate: vi.fn(), allowed: true }));
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("@/hooks/useCurrentShop", () => ({
  useCurrentShop: () => ({ shopId: "shop", can: () => mocks.allowed }),
}));
vi.mock("@/hooks/queries/useInventory", () => ({
  useStockAdjust: () => ({ mutateAsync: mocks.mutate }),
}));
vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({
    data: {
      hasVariants: true,
      variants: [
        { id: "red", name: "Red", stockQuantity: 5, isActive: true },
        { id: "inactive", name: "Old", stockQuantity: 2, isActive: false },
      ],
    },
  }),
}));
import { StockAdjustDialog } from "@/components/inventory/StockAdjustDialog";

describe("stock adjustment UI", () => {
  beforeEach(() => {
    mocks.allowed = true;
    mocks.mutate.mockResolvedValue({});
    Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.setAttribute("open", "");
      },
    });
    Object.defineProperty(HTMLDialogElement.prototype, "close", {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.removeAttribute("open");
      },
    });
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("requires an active variant and sends the chosen correction reason", async () => {
    render(<StockAdjustDialog productId="product" />);
    fireEvent.click(screen.getByRole("button", { name: "adjust" }));
    expect(screen.queryByRole("option", { name: "Old (2)" })).toBeNull();
    fireEvent.change(screen.getByRole("combobox", { name: "variant" }), {
      target: { value: "red" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "change" }), {
      target: { value: "-২" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "reason" }), {
      target: { value: "ADJUSTMENT" },
    });
    fireEvent.submit(screen.getByRole("dialog").querySelector("form")!);
    await waitFor(() =>
      expect(mocks.mutate).toHaveBeenCalledWith({
        productId: "product",
        variantId: "red",
        change: -2,
        reason: "ADJUSTMENT",
        note: undefined,
      }),
    );
  });

  it("does not expose the action without inventory permission", () => {
    mocks.allowed = false;
    render(<StockAdjustDialog productId="product" />);
    expect(screen.queryByRole("button", { name: "adjust" })).toBeNull();
  });
});
