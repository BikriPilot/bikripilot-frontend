import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ProductDTO } from "@/types/product";

const mocks = vi.hoisted(() => ({
  update: vi.fn(),
  create: vi.fn(),
  push: vi.fn(),
  canWrite: true,
  category: vi.fn(),
  refetch: vi.fn(),
}));
vi.mock("@/hooks/useCurrentShop", () => ({
  useCurrentShop: () => ({ can: () => mocks.canWrite, shopId: "shop" }),
}));
vi.mock("@/lib/api/products.api", () => ({
  productsApi: { createCategory: mocks.category },
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, back: vi.fn() }),
}));
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("@/hooks/queries/useProducts", () => ({
  useCategories: () => ({ data: [], refetch: mocks.refetch }),
  useProductMutations: () => ({
    update: { mutateAsync: mocks.update },
    create: { mutateAsync: mocks.create },
  }),
}));
vi.mock("@/components/common/ImageUploader", () => ({
  ImageUploader: () => null,
}));
import { ProductForm } from "@/components/products/ProductForm";

describe("product edit payload", () => {
  it("creates and selects a category without saving the product", async () => {
    mocks.category.mockResolvedValue({ id: "category", name: "Clothing" });
    render(<ProductForm />);
    fireEvent.change(screen.getByRole("textbox", { name: "categoryName" }), {
      target: { value: "Clothing" },
    });
    fireEvent.click(screen.getByRole("button", { name: "addCategory" }));
    await waitFor(() =>
      expect(mocks.category).toHaveBeenCalledWith("shop", "Clothing"),
    );
    expect(mocks.create).not.toHaveBeenCalled();
    await waitFor(() => expect(mocks.refetch).toHaveBeenCalled());
  });
  it("generates option combinations and permits removal", async () => {
    render(<ProductForm />);
    fireEvent.change(screen.getByRole("textbox", { name: "name" }), {
      target: { value: "Shirt" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "price" }), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "optionName" }), {
      target: { value: "Color" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "optionValues" }), {
      target: { value: "Red,Blue" },
    });
    fireEvent.click(screen.getByRole("button", { name: "generateVariants" }));
    expect(
      screen.getAllByRole("textbox", { name: "variantName" }),
    ).toHaveLength(2);
    fireEvent.click(
      screen.getAllByRole("button", { name: "removeVariant" })[1],
    );
    fireEvent.change(screen.getByRole("textbox", { name: "variantStock" }), {
      target: { value: "3" },
    });
    fireEvent.click(screen.getByRole("button", { name: "save" }));
    await waitFor(() => expect(mocks.create).toHaveBeenCalledOnce());
    expect(mocks.create.mock.calls[0][0].variants).toEqual([
      { name: "Red", options: { Color: "Red" }, stockQuantity: 3 },
    ]);
  });
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    mocks.canWrite = true;
  });
  it("prevents product editing without write permission", () => {
    mocks.canWrite = false;
    render(<ProductForm />);
    expect(screen.getByRole("textbox", { name: "name" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "save" })).toBeDisabled();
  });
  it("preserves FAQs and sends only variant input fields, not stock edits or DTO fields", async () => {
    const product = {
      id: "product",
      name: "Shirt",
      description: null,
      category: null,
      compareAtPricePaisa: null,
      costPaisa: null,
      lowStockThreshold: null,
      weightGrams: null,
      sku: null,
      hasVariants: true,
      isLowStock: false,
      createdAt: "2026-10-09T00:00:00.000Z",
      updatedAt: "2026-10-09T00:00:00.000Z",
      pricePaisa: 10000,
      status: "ACTIVE",
      stockQuantity: 5,
      trackStock: true,
      images: [],
      keywords: [],
      faq: [{ q: "Size?", a: "Large" }],
      variants: [
        {
          id: "variant",
          name: "Red",
          options: { Color: "Red" },
          isActive: true,
          pricePaisa: null,
          costPaisa: null,
          sku: null,
          sortOrder: 0,
          stockQuantity: 5,
          effectivePricePaisa: 10000,
        },
      ],
    } as ProductDTO;
    render(<ProductForm product={product} />);
    fireEvent.change(screen.getByRole("textbox", { name: "keyword" }), {
      target: { value: "cotton" },
    });
    fireEvent.click(screen.getByRole("button", { name: "addKeyword" }));
    fireEvent.change(screen.getByRole("spinbutton", { name: "weightGrams" }), {
      target: { value: "250" },
    });
    fireEvent.click(screen.getByRole("button", { name: "save" }));
    await waitFor(() => expect(mocks.update).toHaveBeenCalledOnce());
    const body = mocks.update.mock.calls[0][0].body;
    expect(body.faq).toEqual(product.faq);
    expect(body.keywords).toEqual(["cotton"]);
    expect(body.weightGrams).toBe(250);
    expect(body).not.toHaveProperty("stockQuantity");
    expect(body.variants[0]).not.toHaveProperty("effectivePricePaisa");
    expect(body.variants[0]).not.toHaveProperty("stockQuantity");
  });
});
