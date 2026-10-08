import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ upload: vi.fn() }));
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("@/hooks/useCurrentShop", () => ({
  useCurrentShop: () => ({ shopId: "shop", can: () => true }),
}));
vi.mock("@/lib/api/uploads.api", () => ({
  uploadsApi: { image: mocks.upload },
}));
import { ImageUploader } from "@/components/common/ImageUploader";

describe("image upload controls", () => {
  afterEach(() => {
    cleanup();
    mocks.upload.mockReset();
  });
  it("prevents overlapping uploads and signals pending work", async () => {
    let finish!: (result: { url: string }) => void;
    mocks.upload.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const change = vi.fn();
    const busy = vi.fn();
    const view = render(
      <ImageUploader value={[]} onChange={change} onBusyChange={busy} />,
    );
    const input = view.container.querySelector("input")!;
    const file = new File(["image"], "test.png", { type: "image/png" });
    act(() => {
      fireEvent.change(input, { target: { files: [file] } });
      fireEvent.change(input, { target: { files: [file] } });
    });
    expect(mocks.upload).toHaveBeenCalledTimes(1);
    expect(busy).toHaveBeenCalledWith(true);
    await act(async () => finish({ url: "https://example.com/image.png" }));
    expect(change).toHaveBeenCalledWith(["https://example.com/image.png"]);
    expect(busy).toHaveBeenLastCalledWith(false);
  });
  it("retains successful files when a later upload fails", async () => {
    mocks.upload
      .mockResolvedValueOnce({ url: "https://example.com/first.png" })
      .mockRejectedValueOnce(new Error("Provider error"));
    const change = vi.fn();
    const view = render(<ImageUploader value={[]} onChange={change} />);
    fireEvent.change(view.container.querySelector("input")!, {
      target: {
        files: [
          new File(["first"], "first.png", { type: "image/png" }),
          new File(["second"], "second.png", { type: "image/png" }),
        ],
      },
    });
    await waitFor(() => expect(screen.getByText("uploadError")).toBeTruthy());
    expect(change).toHaveBeenCalledWith(["https://example.com/first.png"]);
  });
  it("reorders images without deleting them", () => {
    const change = vi.fn();
    render(<ImageUploader value={["first", "second"]} onChange={change} />);
    fireEvent.click(
      screen.getAllByRole("button", { name: "moveImageRight" })[0],
    );
    expect(change).toHaveBeenCalledWith(["second", "first"]);
  });
});
