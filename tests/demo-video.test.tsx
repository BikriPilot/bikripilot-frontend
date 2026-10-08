import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
import { DemoVideo } from "@/components/landing/DemoVideo";

describe("landing demo", () => {
  afterEach(cleanup);
  it("does not render arbitrary or insecure embed URLs", () => {
    render(
      <DemoVideo url="https://evil.example/watch?v=M7lc1UVf-VE" label="Demo" />,
    );
    expect(screen.queryByRole("button", { name: "Demo" })).toBeNull();
  });
  it("loads its frame only after opening and removes it on close", () => {
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
    render(<DemoVideo url="https://youtu.be/M7lc1UVf-VE" label="Demo" />);
    expect(document.querySelector("iframe")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Demo" }));
    expect(document.querySelector("iframe")?.src).toBe(
      "https://www.youtube-nocookie.com/embed/M7lc1UVf-VE",
    );
    fireEvent.click(screen.getByRole("button", { name: "closeDemo" }));
    expect(document.querySelector("iframe")).toBeNull();
  });
});
