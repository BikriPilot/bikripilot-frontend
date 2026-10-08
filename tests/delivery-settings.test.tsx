import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DeliverySettingsPage from "@/app/dashboard/(settings)/settings/delivery/page";

const mocks = vi.hoisted(() => ({ updateSettings: vi.fn(), refetch: vi.fn() }));
vi.mock("@/lib/api/shops.api", () => ({
  shopsApi: { updateSettings: mocks.updateSettings },
}));
vi.mock("@/hooks/useCurrentShop", () => ({
  useCurrentShop: () => ({ shopId: "shop", can: () => true }),
}));
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({
    isPending: false,
    isError: false,
    refetch: mocks.refetch,
    data: {
      deliveryChargeInsideDhakaPaisa: 7000,
      deliveryChargeSubDhakaPaisa: 10000,
      deliveryChargeOutsideDhakaPaisa: 13000,
      orderPrefix: "BK-",
      duplicateWindowHours: 48,
      freeDeliveryMinPaisa: 50000,
      allowOversell: false,
      defaultPaymentMethod: "COD",
      lowStockThreshold: 5,
      invoiceNote: null,
      publicTrackingEnabled: true,
    },
  }),
}));

describe("free delivery settings", () => {
  beforeEach(() => {
    cleanup();
    mocks.updateSettings.mockReset();
    mocks.updateSettings.mockResolvedValue({});
  });
  it("keeps the typed amount in taka and submits integer paisa", async () => {
    render(<DeliverySettingsPage />);
    const input = screen.getByRole("textbox", { name: "freeDelivery" });
    fireEvent.change(input, { target: { value: "1250.50" } });
    expect(input).toHaveValue("1250.50");
    fireEvent.click(screen.getByRole("button", { name: "saveChanges" }));
    await waitFor(() =>
      expect(mocks.updateSettings).toHaveBeenCalledWith(
        "shop",
        expect.objectContaining({ freeDeliveryMinPaisa: 125050 }),
      ),
    );
  });
  it("disables free delivery when its minimum is cleared", async () => {
    render(<DeliverySettingsPage />);
    fireEvent.change(screen.getByRole("textbox", { name: "freeDelivery" }), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "saveChanges" }));
    await waitFor(() =>
      expect(mocks.updateSettings).toHaveBeenCalledWith(
        "shop",
        expect.objectContaining({ freeDeliveryMinPaisa: null }),
      ),
    );
  });
});
