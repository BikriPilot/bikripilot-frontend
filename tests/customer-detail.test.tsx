vi.mock("@/hooks/useCurrentShop", () => ({
  useCurrentShop: () => ({ can: () => true }),
}));
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ update: vi.fn(), linked: false }));
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("@/components/risk/RiskCheckDialog", () => ({
  RiskCheckDialog: () => null,
}));
vi.mock("@/hooks/queries/useCustomers", () => ({
  useCustomer: () => ({
    data: {
      id: "customer",
      name: "Customer",
      phone: "01712345678",
      email: "test@example.com",
      totalOrders: 0,
      deliveredOrders: 0,
      totalSpentPaisa: 0,
      tags: [],
      identities: [],
      conversationIds: mocks.linked ? ["conversation-1"] : [],
      hisab: mocks.linked ? { partyId: "party-1", balancePaisa: 125050 } : null,
    },
  }),
  useCustomerMutations: () => ({
    update: { mutateAsync: mocks.update },
    block: { mutateAsync: vi.fn() },
  }),
}));
import { CustomerDetail } from "@/components/customers/CustomerDetail";
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
import en from "../messages/en.json";
import bn from "../messages/bn.json";
vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({
    data: { data: [], meta: { totalPages: 0 } },
    isPending: false,
  }),
}));

describe("customer editing", () => {
  it("exposes the existing conversation and ledger statement routes", () => {
    mocks.linked = true;
    render(<CustomerDetail id="customer" />);
    expect(
      screen.getByRole("link", { name: "conversation 1" }),
    ).toHaveAttribute("href", "/dashboard/inbox/conversation-1");
    expect(screen.getByRole("link", { name: "statement" })).toHaveAttribute(
      "href",
      "/dashboard/hisab/statement/party-1",
    );
    expect(screen.getByText("৳1,250.50")).toBeTruthy();
  });
  it("provides the customer namespace actually requested by the UI", () => {
    for (const messages of [en, bn]) {
      expect(messages.customers.title).toBeTruthy();
      expect(messages.customers.conversations).toBeTruthy();
      expect(messages.customers.noOrders).toBeTruthy();
    }
  });
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    mocks.linked = false;
  });
  it("sends null for cleared optional fields", async () => {
    render(<CustomerDetail id="customer" />);
    fireEvent.click(screen.getByRole("button", { name: "edit" }));
    fireEvent.change(screen.getByRole("textbox", { name: "phone" }), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "email" }), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "save" }));
    await waitFor(() =>
      expect(mocks.update).toHaveBeenCalledWith({
        id: "customer",
        body: expect.objectContaining({
          phone: null,
          email: null,
          address: null,
          area: null,
          notes: null,
        }),
      }),
    );
  });
});
