"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Field, TextField } from "@/components/common/Field";
import { ImageUploader } from "@/components/common/ImageUploader";
import { PageHeader } from "@/components/common/PageHeader";
import { useCategories, useProductMutations } from "@/hooks/queries/useProducts";
import { takaToPaisa } from "@/lib/money";
import type { ProductDTO, ProductInput } from "@/types/product";

export function ProductForm({ product }: { product?: ProductDTO }) {
  const t = useTranslations("products");
  const router = useRouter();
  const categories = useCategories();
  const mutations = useProductMutations();
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
    variants: product?.variants.map((variant) => ({ ...variant })) ?? [],
  });
  const [price, setPrice] = useState(product ? String(product.pricePaisa / 100) : "");
  const [cost, setCost] = useState(product?.costPaisa == null ? "" : String(product.costPaisa / 100));
  const [compareAt, setCompareAt] = useState(product?.compareAtPricePaisa == null ? "" : String(product.compareAtPricePaisa / 100));
  const [stock, setStock] = useState(String(product?.stockQuantity ?? 0));
  const update = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !price) return;
    const body = {
      ...form,
      name: form.name.trim(),
      pricePaisa: takaToPaisa(price),
      costPaisa: cost ? takaToPaisa(cost) : null,
      compareAtPricePaisa: compareAt ? takaToPaisa(compareAt) : null,
      stockQuantity: Math.max(0, Number(stock) || 0),
    };
    try {
      if (product) await mutations.update.mutateAsync({ id: product.id, body });
      else await mutations.create.mutateAsync(body);
      toast.success(t("saved"));
      router.push("/dashboard/products");
    } catch {
      toast.error(t("saveError"));
    }
  };
  const busy = mutations.create.isPending || mutations.update.isPending;
  return (
    <div className="space-y-6">
      <PageHeader title={product ? t("editTitle") : t("newTitle")} description={t("formDescription")} />
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-5 rounded-2xl border bg-card p-5 sm:p-7">
          <Field label={t("name")} value={form.name} onChange={(e) => update("name", e.target.value)} required />
          <TextField label={t("description")} value={form.description ?? ""} onChange={(e) => update("description", e.target.value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("price")} inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} required />
            <Field label={t("compareAtPrice")} inputMode="decimal" value={compareAt} onChange={(e) => setCompareAt(e.target.value)} />
            <Field label={t("cost")} inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} />
            <Field label={t("sku")} value={form.sku ?? ""} onChange={(e) => update("sku", e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium"><span>{t("category")}</span><select value={form.categoryId ?? ""} onChange={(e) => update("categoryId", e.target.value || null)} className="h-11 rounded-lg border bg-card px-3 text-base"><option value="">{t("noCategory")}</option>{categories.data?.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            <label className="grid gap-1.5 text-sm font-medium"><span>{t("status")}</span><select value={form.status} onChange={(e) => update("status", e.target.value as ProductInput["status"])} className="h-11 rounded-lg border bg-card px-3 text-base"><option value="ACTIVE">{t("active")}</option><option value="DRAFT">{t("draft")}</option><option value="ARCHIVED">{t("archived")}</option></select></label>
          </div>
          <ImageUploader value={form.images ?? []} onChange={(value) => update("images", value)} />
          <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={Boolean(form.trackStock)} onChange={(e) => update("trackStock", e.target.checked)} className="size-4 accent-primary" />{t("trackStock")}</label>
          {!form.variants?.length ? <div className="grid gap-4 sm:grid-cols-2"><Field label={t("initialStock")} inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value.replace(/\D/g, ""))} /><Field label={t("lowStockThreshold")} inputMode="numeric" value={form.lowStockThreshold ?? ""} onChange={(e) => update("lowStockThreshold", e.target.value === "" ? null : Number(e.target.value))} /></div> : null}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={() => router.back()} className="min-h-11 rounded-lg border px-4 text-sm font-semibold">{t("cancel")}</button><button disabled={busy} className="min-h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground">{busy ? t("saving") : t("save")}</button></div>
        </div>
        <div className="rounded-2xl border bg-card p-5 sm:p-7"><h2 className="font-semibold">{t("variants")}</h2><p className="mt-1 text-sm text-muted-foreground">{t("variantsDescription")}</p><button type="button" onClick={() => update("variants", [...(form.variants ?? []), { name: `${t("variant")} ${(form.variants?.length ?? 0) + 1}`, options: {}, stockQuantity: 0 }])} className="mt-4 min-h-11 rounded-lg border px-4 text-sm font-semibold">{t("addVariant")}</button>{form.variants?.map((variant, index) => <div key={variant.id ?? index} className="mt-4 rounded-xl border p-3"><Field label={t("variantName")} value={variant.name} onChange={(e) => update("variants", form.variants?.map((item, i) => i === index ? { ...item, name: e.target.value } : item))} /><Field label={t("variantStock")} inputMode="numeric" value={String(variant.stockQuantity ?? 0)} onChange={(e) => update("variants", form.variants?.map((item, i) => i === index ? { ...item, stockQuantity: Number(e.target.value.replace(/\D/g, "")) } : item))} /></div>)}</div>
      </form>
    </div>
  );
}
