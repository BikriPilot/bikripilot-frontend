import { afterEach, describe, expect, it, vi } from "vitest";

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock("@/lib/api/client", () => ({ api: { get, post } }));
import { productsApi } from "@/lib/api/products.api";
import { uploadsApi } from "@/lib/api/uploads.api";

describe("productsApi contracts", () => {
  it("creates categories through the shop-scoped API", async () => {
    post.mockResolvedValue({
      data: { data: { id: "category", name: "Clothing" } },
    });
    await expect(
      productsApi.createCategory("shop-1", "Clothing"),
    ).resolves.toEqual({ id: "category", name: "Clothing" });
    expect(post).toHaveBeenCalledWith("/shops/shop-1/categories", {
      name: "Clothing",
    });
  });
  it("maps shop logo uploads to the backend shop purpose", async () => {
    post.mockResolvedValue({
      data: { data: { url: "https://example.com/logo.png", publicId: "logo" } },
    });
    await uploadsApi.image(
      "shop-1",
      new File(["image"], "logo.png", { type: "image/png" }),
      "shop_logo",
    );
    expect(post.mock.calls[0][1].get("purpose")).toBe("shop");
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    get.mockReset();
    post.mockReset();
  });

  it("preserves created and updated import counts", async () => {
    post.mockResolvedValue({
      data: { data: { created: 2, updated: 1, errors: [] } },
    });
    await expect(
      productsApi.importCsv("shop-1", new File(["name,price"], "products.csv")),
    ).resolves.toEqual({ created: 2, updated: 1, errors: [] });
  });

  it("downloads through the authenticated client and releases its object URL", async () => {
    const blob = new Blob(["name,price"]);
    get.mockResolvedValue({ data: blob });
    const createObjectURL = vi.fn(() => "blob:test");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    await productsApi.downloadExport("shop-1");
    expect(get).toHaveBeenCalledWith("/shops/shop-1/products/export", {
      responseType: "blob",
    });
    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:test");
    expect(document.querySelector('a[download="products.csv"]')).toBeNull();
  });
});
