import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CancelOrderDialog } from "@/components/orders/CancelOrderDialog";
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});
afterEach(cleanup);
describe("order cancellation", () => {
  it("requires a reason, trims it, and closes only after success", async () => {
    const confirm = vi.fn().mockResolvedValue(undefined);
    const close = vi.fn();
    render(<CancelOrderDialog open onClose={close} onConfirm={confirm} />);
    expect(screen.getByRole("button", { name: "submit" })).toBeDisabled();
    fireEvent.change(screen.getByRole("textbox", { name: "reason" }), {
      target: { value: "  Customer changed mind  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "submit" }));
    await waitFor(() =>
      expect(confirm).toHaveBeenCalledWith("Customer changed mind"),
    );
    await waitFor(() => expect(close).toHaveBeenCalled());
  });
  it("keeps the reason on failure and does not mutate on dismiss", async () => {
    const confirm = vi.fn().mockRejectedValue(new Error("Failed"));
    const close = vi.fn();
    render(<CancelOrderDialog open onClose={close} onConfirm={confirm} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Unavailable" },
    });
    fireEvent.click(screen.getByRole("button", { name: "submit" }));
    await screen.findByRole("alert");
    expect(screen.getByRole("textbox")).toHaveValue("Unavailable");
    expect(close).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "keep" }));
    expect(close).toHaveBeenCalledOnce();
    expect(confirm).toHaveBeenCalledOnce();
  });
});
