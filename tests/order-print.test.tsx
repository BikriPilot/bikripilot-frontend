import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { InvoicePrint } from "@/components/orders/InvoicePrint";
import type { OrderDTO } from "@/types/order";

afterEach(cleanup);
describe("order print", () => {
  it("prints English labels and hides prices on packing slips", () => {
    const order = {
      orderNumber: "BK-1",
      customerName: "Buyer",
      customerPhone: "01712345678",
      address: "Dhaka",
      items: [
        {
          id: "line",
          productName: "Product",
          quantity: 1,
          lineTotalPaisa: 10000,
        },
      ],
      subtotalPaisa: 10000,
      discountPaisa: 0,
      deliveryChargePaisa: 7000,
      totalPaisa: 17000,
      advancePaidPaisa: 7000,
      codAmountPaisa: 10000,
    } as OrderDTO;
    render(<InvoicePrint order={order} />);
    expect(screen.getByRole("main")).toHaveAttribute("lang", "en");
    expect(screen.getByText("Delivery charge")).toBeTruthy();
    expect(screen.getByText("Remaining COD")).toBeTruthy();
    fireEvent.click(screen.getByRole("checkbox", { name: "Packing slip" }));
    expect(screen.getByRole("heading", { name: "Packing slip" })).toBeTruthy();
    expect(screen.queryByText("Delivery charge")).toBeNull();
  });
});
