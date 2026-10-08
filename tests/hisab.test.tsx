import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const mocks = vi.hoisted(() => ({ allowed: true }));
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));
vi.mock("@/hooks/useEntitlements", () => ({
  useEntitlements: () => ({ useFeature: () => true }),
}));
vi.mock("@/hooks/useCurrentShop", () => ({
  useCurrentShop: () => ({ shopId: "shop", can: () => mocks.allowed }),
}));
vi.mock("@/lib/api/products.api", () => ({
  productsApi: {
    get: async () => ({
      id: "product",
      trackStock: true,
      hasVariants: false,
      variants: [],
    }),
  },
}));
vi.mock("@/lib/api/hisab.api", () => ({
  hisabApi: {
    parties: async () => ({ data: [{ id: "supplier", name: "Supplier" }] }),
    accounts: async () => [{ id: "cash", name: "Cash", kind: "CASH" }],
    report: async () => ({
      days: [
        {
          date: "2024-01-02",
          salesPaisa: 100000,
          cashInPaisa: 40000,
          cashOutPaisa: 0,
          expensePaisa: 0,
        },
      ],
      totals: {
        salesPaisa: 100000,
        cashInPaisa: 40000,
        cashOutPaisa: 0,
        expensePaisa: 0,
        dueCollectedPaisa: 40000,
      },
      expensesByCategory: [],
    }),
  },
}));
import { PartyForm } from "@/components/hisab/PartyForm";
import { PartyList } from "@/components/hisab/PartyList";
import { PurchaseDialog } from "@/components/inventory/PurchaseDialog";
import { calculateAmount, EntrySheet } from "@/components/hisab/EntrySheet";
import { HisabReport } from "@/components/hisab/HisabReport";
Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
  configurable: true,
  value: function () {
    this.open = true;
  },
});
describe("ledger entry", () => {
  afterEach(() => {
    cleanup();
    mocks.allowed = true;
    vi.restoreAllMocks();
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      {children}
    </QueryClientProvider>
  );
  it("exports English CSV through an attached download anchor", async () => {
    const create = vi.fn().mockReturnValue("blob:report");
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: create,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });
    let connected = false;
    let filename = "";
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      connected = this.isConnected;
      filename = this.download;
    });
    render(<HisabReport />, { wrapper });
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "export" })).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole("button", { name: "export" }));
    expect(connected).toBe(true);
    expect(filename).toMatch(/^ledger-report-.*\.csv$/);
    expect(create).toHaveBeenCalledWith(expect.any(Blob));
  });
  it("preserves fractional signed opening balances", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    render(<PartyForm onClose={vi.fn()} onSave={save} />, { wrapper });
    fireEvent.change(screen.getByLabelText("name"), {
      target: { value: "Opening test" },
    });
    fireEvent.change(screen.getByLabelText("opening"), {
      target: { value: "1250." },
    });
    expect(screen.getByLabelText("opening")).toHaveValue("1250.");
    fireEvent.change(screen.getByLabelText("opening"), {
      target: { value: "1250.50" },
    });
    fireEvent.click(screen.getByRole("radio", { name: "youllGive" }));
    fireEvent.click(screen.getByRole("button", { name: "save" }));
    await waitFor(() =>
      expect(save).toHaveBeenCalledWith(
        expect.objectContaining({ openingBalancePaisa: -125050 }),
      ),
    );
  });
  it("does not expose party write or reminder actions to viewers", () => {
    mocks.allowed = false;
    render(
      <PartyList
        parties={[
          {
            id: "party",
            name: "Read only",
            phone: "01700000000",
            balancePaisa: 60000,
          } as never,
        ]}
        onSelect={vi.fn()}
        onAdd={vi.fn()}
        onRemind={vi.fn()}
        t={(key) => key}
      />,
    );
    expect(screen.queryByRole("button", { name: "addParty" })).toBeNull();
    expect(screen.queryByRole("button", { name: "reminder" })).toBeNull();
    expect(screen.getByText("youllGet")).toBeInTheDocument();
  });
  it("submits stock lines with supplier and paid-now account", async () => {
    const save = vi.fn();
    render(
      <PurchaseDialog
        products={[{ id: "product", name: "Product" } as never]}
        busy={false}
        onClose={vi.fn()}
        onSave={save}
        t={(key) => key}
      />,
      { wrapper },
    );
    await screen.findByRole("option", { name: "Supplier" });
    fireEvent.change(screen.getByLabelText("supplier"), {
      target: { value: "supplier" },
    });
    fireEvent.change(screen.getByLabelText("quantity"), {
      target: { value: "৫" },
    });
    fireEvent.change(screen.getByLabelText("unitCost"), {
      target: { value: "১০০" },
    });
    fireEvent.change(screen.getByLabelText("paidNow"), {
      target: { value: "২০০" },
    });
    await screen.findByRole("option", { name: "Cash" });
    fireEvent.change(screen.getByLabelText("account"), {
      target: { value: "cash" },
    });
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "save" })).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole("button", { name: "save" }));
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        supplierPartyId: "supplier",
        moneyAccountId: "cash",
        paidAmountPaisa: 20000,
        items: [
          {
            productId: "product",
            variantId: undefined,
            quantity: 5,
            unitCostPaisa: 10000,
          },
        ],
      }),
    );
  });
  it("evaluates arithmetic and rejects executable and nonfinite inputs", () => {
    expect(calculateAmount("1000-400")).toBe(60000);
    expect(calculateAmount("2*(100+25.50)")).toBe(25100);
    expect(calculateAmount("1/0")).toBeNull();
    expect(calculateAmount("import('x')")).toBeNull();
  });
  it("submits the selected date and calculated paisa", () => {
    const save = vi.fn();
    render(
      <EntrySheet
        direction="GAVE"
        accounts={[]}
        busy={false}
        onClose={vi.fn()}
        onSave={save}
        t={(key) => key}
      />,
    );
    fireEvent.change(screen.getByLabelText("amount"), {
      target: { value: "১০০০-৪০০" },
    });
    fireEvent.change(screen.getByLabelText("date"), {
      target: { value: "2024-01-02" },
    });
    fireEvent.click(screen.getByRole("button", { name: "save" }));
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        amountPaisa: 60000,
        entryDate: "2024-01-02",
        direction: "GAVE",
      }),
      false,
    );
  });
});
