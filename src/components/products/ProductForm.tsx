"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Field, TextField } from "@/components/common/Field";
import { ImageUploader } from "@/components/common/ImageUploader";
import { PageHeader } from "@/components/common/PageHeader";
import {
  useCategories,
  useProductMutations,
} from "@/hooks/queries/useProducts";
import { takaToPaisa } from "@/lib/money";
import type { ProductDTO, ProductInput } from "@/types/product";
import { Plus, Trash2, X } from "lucide-react";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { productsApi } from "@/lib/api/products.api";

export function ProductForm({ product }: { product?: ProductDTO }) {
  const t = useTranslations("products");
  const router = useRouter();
  const categories = useCategories();
  const mutations = useProductMutations();
  const { can, shopId } = useCurrentShop();
  const canWrite = can("product.write");
  const [form, setForm] = useState<ProductInput>({
    name: product?.name ?? "",
    description: product?.description ?? "",
    status: product?.status ?? "ACTIVE",
    sku: product?.sku ?? "",
    categoryId: product?.category?.id ?? null,
    pricePaisa: product?.pricePaisa ?? 0,
    compareAtPricePaisa: product?.compareAtPricePaisa ?? null,
    costPaisa: product?.costPaisa ?? null,
    trackStock: product?.trackStock ?? true,
    stockQuantity: product?.stockQuantity ?? 0,
    lowStockThreshold: product?.lowStockThreshold ?? null,
    images: product?.images ?? [],
    keywords: product?.keywords ?? [],
    weightGrams: product?.weightGrams ?? null,
    faq: product?.faq ?? [],
    variants:
      product?.variants
        .filter((variant) => variant.isActive)
        .map(
          ({
            id,
            name,
            options,
            sku,
            pricePaisa,
            costPaisa,
            isActive,
            sortOrder,
          }) => ({
            id,
            name,
            options,
            sku,
            pricePaisa,
            costPaisa,
            isActive,
            sortOrder,
          }),
        ) ?? [],
  });
  const [price, setPrice] = useState(
    product ? String(product.pricePaisa / 100) : "",
  );
  const [cost, setCost] = useState(
    product?.costPaisa == null ? "" : String(product.costPaisa / 100),
  );
  const [compareAt, setCompareAt] = useState(
    product?.compareAtPricePaisa == null
      ? ""
      : String(product.compareAtPricePaisa / 100),
  );
  const [stock, setStock] = useState(String(product?.stockQuantity ?? 0));
  const [keyword, setKeyword] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categoryBusy, setCategoryBusy] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const changeCategory = async (action: "create" | "rename" | "delete") => {
    if (
      !canWrite ||
      !shopId ||
      categoryBusy ||
      (action !== "delete" && !categoryName.trim())
    )
      return;
    if (action !== "create" && !form.categoryId) return;
    if (action === "delete" && !window.confirm(t("deleteCategoryConfirm")))
      return;
    setCategoryBusy(true);
    try {
      if (action === "create")
        update(
          "categoryId",
          (await productsApi.createCategory(shopId, categoryName.trim())).id,
        );
      else if (action === "rename")
        await productsApi.updateCategory(
          shopId,
          form.categoryId!,
          categoryName.trim(),
        );
      else {
        await productsApi.removeCategory(shopId, form.categoryId!);
        update("categoryId", null);
      }
      await categories.refetch();
      setCategoryName("");
    } catch {
      toast.error(t("categoryError"));
    } finally {
      setCategoryBusy(false);
    }
  };
  const [optionRows, setOptionRows] = useState([{ name: "", values: "" }]);
  const generateVariants = () => {
    const options = optionRows.map((row) => ({
      name: row.name.trim(),
      values: [
        ...new Set(
          row.values
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
        ),
      ],
    }));
    if (
      options.some((option) => !option.name || !option.values.length) ||
      new Set(options.map((option) => option.name)).size !== options.length
    )
      return;
    const count = options.reduce(
      (total, option) => total * option.values.length,
      1,
    );
    if (count + (form.variants?.length ?? 0) > 100) {
      toast.error(t("variantLimit"));
      return;
    }
    let combinations: Record<string, string>[] = [{}];
    for (const option of options)
      combinations = combinations.flatMap((combination) =>
        option.values.map((value) => ({
          ...combination,
          [option.name]: value,
        })),
      );
    update("variants", [
      ...(form.variants ?? []),
      ...combinations
        .filter(
          (combination) =>
            !form.variants?.some(
              (variant) =>
                Object.keys(variant.options).length ===
                  Object.keys(combination).length &&
                Object.entries(combination).every(
                  ([key, value]) => variant.options[key] === value,
                ),
            ),
        )
        .map((options) => ({
          name: Object.values(options).join(" / "),
          options,
          stockQuantity: 0,
        })),
    ]);
  };
  const update = <K extends keyof ProductInput>(
    key: K,
    value: ProductInput[K],
  ) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canWrite || uploadBusy || categoryBusy || !form.name.trim() || !price)
      return;
    const body = {
      ...form,
      name: form.name.trim(),
      pricePaisa: takaToPaisa(price),
      costPaisa: cost ? takaToPaisa(cost) : null,
      compareAtPricePaisa: compareAt ? takaToPaisa(compareAt) : null,
      stockQuantity: Math.max(0, Number(stock) || 0),
    };
    if (product) delete (body as Partial<ProductInput>).stockQuantity;
    try {
      if (product) await mutations.update.mutateAsync({ id: product.id, body });
      else await mutations.create.mutateAsync(body);
      toast.success(t("saved"));
      router.push("/dashboard/products");
    } catch {
      toast.error(t("saveError"));
    }
  };
  const busy =
    mutations.create.isPending ||
    mutations.update.isPending ||
    uploadBusy ||
    categoryBusy;
  return (
    <div className="space-y-6">
      <PageHeader
        title={product ? t("editTitle") : t("newTitle")}
        description={t("formDescription")}
      />
      <form onSubmit={submit}>
        <fieldset
          disabled={!canWrite || busy}
          className="grid min-w-0 gap-6 lg:grid-cols-[2fr_1fr]"
        >
          <div className="flex min-w-0 flex-col gap-5 border bg-card p-5 sm:p-7">
            <Field
              label={t("name")}
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
            />
            <TextField
              label={t("description")}
              value={form.description ?? ""}
              onChange={(e) => update("description", e.target.value)}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={t("price")}
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
              <Field
                label={t("compareAtPrice")}
                inputMode="decimal"
                value={compareAt}
                onChange={(e) => setCompareAt(e.target.value)}
              />
              <Field
                label={t("cost")}
                inputMode="decimal"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
              <Field
                label={t("sku")}
                value={form.sku ?? ""}
                onChange={(e) => update("sku", e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-medium">
                <span>{t("category")}</span>
                <select
                  value={form.categoryId ?? ""}
                  onChange={(e) => update("categoryId", e.target.value || null)}
                  className="h-11 rounded-lg border bg-card px-3 text-base"
                >
                  <option value="">{t("noCategory")}</option>
                  {categories.data?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                <span>{t("status")}</span>
                <select
                  value={form.status}
                  onChange={(e) =>
                    update("status", e.target.value as ProductInput["status"])
                  }
                  className="h-11 rounded-lg border bg-card px-3 text-base"
                >
                  <option value="ACTIVE">{t("active")}</option>
                  <option value="DRAFT">{t("draft")}</option>
                  <option value="ARCHIVED">{t("archived")}</option>
                </select>
              </label>
            </div>
            {canWrite ? (
              <div className="space-y-2 border-t pt-3">
                <Field
                  label={t("categoryName")}
                  value={categoryName}
                  maxLength={100}
                  onChange={(event) => setCategoryName(event.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={categoryBusy || !categoryName.trim()}
                    onClick={() => void changeCategory("create")}
                    className="min-h-11 rounded-lg border px-3 text-sm"
                  >
                    {t("addCategory")}
                  </button>
                  <button
                    type="button"
                    disabled={
                      categoryBusy || !categoryName.trim() || !form.categoryId
                    }
                    onClick={() => void changeCategory("rename")}
                    className="min-h-11 rounded-lg border px-3 text-sm"
                  >
                    {t("renameCategory")}
                  </button>
                  <button
                    type="button"
                    disabled={categoryBusy || !form.categoryId}
                    onClick={() => void changeCategory("delete")}
                    aria-label={t("deleteCategory")}
                    title={t("deleteCategory")}
                    className="inline-flex size-11 items-center justify-center rounded-lg border text-danger"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ) : null}
            <ImageUploader
              onBusyChange={setUploadBusy}
              value={form.images ?? []}
              onChange={(value) => update("images", value)}
            />
            <label className="flex min-h-11 items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={Boolean(form.trackStock)}
                onChange={(e) => update("trackStock", e.target.checked)}
                className="size-4 accent-primary"
              />
              {t("trackStock")}
            </label>
            {!form.variants?.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label={product ? t("stock") : t("initialStock")}
                  readOnly={Boolean(product)}
                  inputMode="numeric"
                  value={stock}
                  onChange={(e) => setStock(e.target.value.replace(/\D/g, ""))}
                />
                <Field
                  label={t("lowStockThreshold")}
                  inputMode="numeric"
                  value={form.lowStockThreshold ?? ""}
                  onChange={(e) =>
                    update(
                      "lowStockThreshold",
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                />
              </div>
            ) : null}
            <section className="space-y-3 border-t pt-4">
              <h2 className="font-semibold">{t("aiHelp")}</h2>
              <div className="flex flex-wrap gap-2">
                {form.keywords?.map((value) => (
                  <span
                    key={value}
                    className="inline-flex items-center gap-1 border px-2 py-1 text-sm"
                  >
                    {value}
                    <button
                      type="button"
                      aria-label={`${t("removeKeyword")} ${value}`}
                      title={t("removeKeyword")}
                      onClick={() =>
                        update(
                          "keywords",
                          form.keywords?.filter((item) => item !== value),
                        )
                      }
                      className="inline-flex size-8 items-center justify-center"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-end gap-2">
                <div className="min-w-0 flex-1">
                  <Field
                    label={t("keyword")}
                    value={keyword}
                    maxLength={100}
                    onChange={(event) => setKeyword(event.target.value)}
                  />
                </div>
                <button
                  type="button"
                  aria-label={t("addKeyword")}
                  title={t("addKeyword")}
                  disabled={
                    !keyword.trim() || (form.keywords?.length ?? 0) >= 50
                  }
                  onClick={() => {
                    update("keywords", [
                      ...new Set([...(form.keywords ?? []), keyword.trim()]),
                    ]);
                    setKeyword("");
                  }}
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border"
                >
                  <Plus size={18} />
                </button>
              </div>
              <h3 className="text-sm font-semibold">{t("faq")}</h3>
              {form.faq?.map((entry, index) => (
                <div key={index} className="space-y-2 border-t pt-3">
                  <Field
                    label={t("question")}
                    value={entry.q}
                    maxLength={500}
                    required
                    onChange={(event) =>
                      update(
                        "faq",
                        form.faq?.map((item, entryIndex) =>
                          entryIndex === index
                            ? { ...item, q: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <TextField
                    label={t("answer")}
                    value={entry.a}
                    maxLength={2000}
                    required
                    onChange={(event) =>
                      update(
                        "faq",
                        form.faq?.map((item, entryIndex) =>
                          entryIndex === index
                            ? { ...item, a: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <button
                    type="button"
                    aria-label={t("removeFaq")}
                    title={t("removeFaq")}
                    onClick={() =>
                      update(
                        "faq",
                        form.faq?.filter(
                          (_, entryIndex) => entryIndex !== index,
                        ),
                      )
                    }
                    className="inline-flex size-11 items-center justify-center rounded-lg border text-danger"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                disabled={(form.faq?.length ?? 0) >= 50}
                onClick={() =>
                  update("faq", [...(form.faq ?? []), { q: "", a: "" }])
                }
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm"
              >
                <Plus size={16} />
                {t("addFaq")}
              </button>
            </section>
            <Field
              label={t("weightGrams")}
              type="number"
              min={1}
              max={100000}
              step={1}
              value={form.weightGrams ?? ""}
              onChange={(event) =>
                update(
                  "weightGrams",
                  event.target.value === "" ? null : Number(event.target.value),
                )
              }
            />
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                className="min-h-11 rounded-lg border px-4 text-sm font-semibold"
              >
                {t("cancel")}
              </button>
              <button
                disabled={busy}
                className="min-h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground"
              >
                {busy ? t("saving") : t("save")}
              </button>
            </div>
          </div>
          <div className="min-w-0 border bg-card p-5 sm:p-7">
            <h2 className="font-semibold">{t("variants")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("variantsDescription")}
            </p>
            <div className="mt-4 space-y-3">
              {optionRows.map((row, index) => (
                <div key={index} className="space-y-2 border-t pt-3">
                  <Field
                    label={t("optionName")}
                    value={row.name}
                    maxLength={50}
                    onChange={(event) =>
                      setOptionRows(
                        optionRows.map((item, rowIndex) =>
                          rowIndex === index
                            ? { ...item, name: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <Field
                    label={t("optionValues")}
                    value={row.values}
                    onChange={(event) =>
                      setOptionRows(
                        optionRows.map((item, rowIndex) =>
                          rowIndex === index
                            ? { ...item, values: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  {optionRows.length > 1 ? (
                    <button
                      type="button"
                      aria-label={t("removeOption")}
                      title={t("removeOption")}
                      onClick={() =>
                        setOptionRows(
                          optionRows.filter(
                            (_, rowIndex) => rowIndex !== index,
                          ),
                        )
                      }
                      className="inline-flex size-11 items-center justify-center rounded-lg border"
                    >
                      <Trash2 size={18} />
                    </button>
                  ) : null}
                </div>
              ))}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={optionRows.length >= 3}
                  onClick={() =>
                    setOptionRows([...optionRows, { name: "", values: "" }])
                  }
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-3"
                >
                  <Plus size={16} />
                  {t("addOption")}
                </button>
                <button
                  type="button"
                  onClick={generateVariants}
                  className="min-h-11 rounded-lg border px-3"
                >
                  {t("generateVariants")}
                </button>
              </div>
            </div>
            <button
              type="button"
              disabled={(form.variants?.length ?? 0) >= 100}
              onClick={() =>
                update("variants", [
                  ...(form.variants ?? []),
                  {
                    name: `${t("variant")} ${(form.variants?.length ?? 0) + 1}`,
                    options: {},
                    stockQuantity: 0,
                  },
                ])
              }
              className="mt-4 min-h-11 rounded-lg border px-4 text-sm font-semibold"
            >
              {t("addVariant")}
            </button>
            {form.variants?.map((variant, index) => (
              <div
                key={variant.id ?? index}
                className="mt-4 rounded-xl border p-3"
              >
                <Field
                  label={t("variantName")}
                  value={variant.name}
                  onChange={(e) =>
                    update(
                      "variants",
                      form.variants?.map((item, i) =>
                        i === index ? { ...item, name: e.target.value } : item,
                      ),
                    )
                  }
                />
                <Field
                  label={t("variantStock")}
                  readOnly={Boolean(variant.id)}
                  inputMode="numeric"
                  value={String(
                    variant.id
                      ? (product?.variants.find(
                          (item) => item.id === variant.id,
                        )?.stockQuantity ?? 0)
                      : (variant.stockQuantity ?? 0),
                  )}
                  onChange={(e) =>
                    update(
                      "variants",
                      form.variants?.map((item, i) =>
                        i === index
                          ? {
                              ...item,
                              stockQuantity: Number(
                                e.target.value.replace(/\D/g, ""),
                              ),
                            }
                          : item,
                      ),
                    )
                  }
                />
                <Field
                  label={t("sku")}
                  value={variant.sku ?? ""}
                  onChange={(event) =>
                    update(
                      "variants",
                      form.variants?.map((item, variantIndex) =>
                        variantIndex === index
                          ? { ...item, sku: event.target.value || null }
                          : item,
                      ),
                    )
                  }
                />
                <Field
                  label={t("price")}
                  type="number"
                  min={0}
                  step="0.01"
                  value={
                    variant.pricePaisa == null ? "" : variant.pricePaisa / 100
                  }
                  onChange={(event) =>
                    update(
                      "variants",
                      form.variants?.map((item, variantIndex) =>
                        variantIndex === index
                          ? {
                              ...item,
                              pricePaisa: event.target.value
                                ? takaToPaisa(event.target.value)
                                : null,
                            }
                          : item,
                      ),
                    )
                  }
                />
                {Object.entries(variant.options).map(([name, value]) => (
                  <Field
                    key={name}
                    label={name}
                    value={value}
                    maxLength={100}
                    onChange={(event) =>
                      update(
                        "variants",
                        form.variants?.map((item, variantIndex) =>
                          variantIndex === index
                            ? {
                                ...item,
                                options: {
                                  ...item.options,
                                  [name]: event.target.value,
                                },
                              }
                            : item,
                        ),
                      )
                    }
                  />
                ))}
                <button
                  type="button"
                  aria-label={t("removeVariant")}
                  title={t("removeVariant")}
                  onClick={() =>
                    update(
                      "variants",
                      form.variants?.filter(
                        (_, variantIndex) => variantIndex !== index,
                      ),
                    )
                  }
                  className="mt-3 inline-flex size-11 items-center justify-center rounded-lg border text-danger"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </fieldset>
      </form>
    </div>
  );
}
