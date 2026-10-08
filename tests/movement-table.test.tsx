import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ useInventory: vi.fn() }));
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("@/hooks/queries/useInventory", () => ({
  useInventory: mocks.useInventory,
}));
import { MovementTable } from "@/components/inventory/MovementTable";

describe("movement history", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });
  it("requests the next page for the selected product", () => {
    mocks.useInventory.mockReturnValue({
      data: {
        data: [
          {
            id: "movement",
            reason: "INITIAL",
            change: 1,
            note: null,
            createdAt: "2026-10-08T20:00:00Z",
          },
        ],
        meta: { totalPages: 2 },
      },
    });
    render(<MovementTable productId="product" />);
    expect(screen.getByText("reasons.INITIAL")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "nextPage" }));
    expect(mocks.useInventory).toHaveBeenLastCalledWith(
      "movements",
      "product",
      2,
    );
  });
});
