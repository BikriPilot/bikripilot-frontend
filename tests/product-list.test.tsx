import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  writable: false,
  exportEnabled: false,
  importCsv: vi.fn(),
}));
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("@/hooks/useCurrentShop", () => ({
  useCurrentShop: () => ({ shopId: "shop", can: () => mocks.writable }),
}));
vi.mock("@/hooks/useEntitlements", () => ({
  useEntitlements: () => ({ useFeature: () => mocks.exportEnabled }),
}));
vi.mock("@/hooks/queries/useProducts", () => ({
  useProducts: () => ({ data: { data: [] }, isPending: false, isError: false }),
  useCategories: () => ({ data: [] }),
  useProductMutations: () => ({
    importCsv: { mutateAsync: mocks.importCsv, isPending: false },
  }),
}));
vi.mock("@/components/inventory/StockAdjustDialog", () => ({
  StockAdjustDialog: () => null,
}));
import { ProductList } from "@/components/products/ProductList";

describe("product list permissions", () => {
  it("reports import counts and row errors inside the dialog", async () => {
    mocks.writable = true;
    mocks.importCsv.mockResolvedValue({
      created: 2,
      updated: 1,
      errors: [{ row: 4, message: "Invalid price" }],
    });
    Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.setAttribute("open", "");
      },
    });
    render(<ProductList />);
    fireEvent.click(screen.getByRole("button", { name: "importCsv" }));
    const dialog = within(screen.getByRole("dialog"));
    fireEvent.change(dialog.getByLabelText("csvFile"), {
      target: {
        files: [new File(["name,price"], "products.csv", { type: "text/csv" })],
      },
    });
    await waitFor(() =>
      expect(
        dialog.getByText("createdCount: 2 · updatedCount: 1"),
      ).toBeTruthy(),
    );
    expect(dialog.getByText("row 4: Invalid price")).toBeTruthy();
  });
  afterEach(() => {
    cleanup();
    mocks.writable = false;
    mocks.exportEnabled = false;
  });
  it("keeps templates available without export benefits and hides writes", () => {
    render(<ProductList />);
    expect(screen.getByRole("button", { name: "template" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: "exportCsv" })).toBeNull();
    expect(screen.queryByRole("link", { name: "addProduct" })).toBeNull();
    expect(screen.queryByText("importCsv")).toBeNull();
  });
  it("exposes export only when the benefit is enabled", () => {
    mocks.exportEnabled = true;
    render(<ProductList />);
    expect(screen.getByRole("button", { name: "exportCsv" })).toBeEnabled();
  });
});
