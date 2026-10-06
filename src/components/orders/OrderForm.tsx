"use client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useOrderMutations } from "@/hooks/queries/useOrders";
import { useProducts } from "@/hooks/queries/useProducts";
export function OrderForm() {
  const t = useTranslations("orders"); const router = useRouter(); const mutation = useOrderMutations().create; const products = useProducts({ page: 1, limit: 100 });
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    try {
      const productId = String(data.get("productId") ?? "");
      const product = products.data?.data.find((item) => item.id === productId);
      if (!product) { toast.error(t("productRequired")); return; }
      const order = await mutation.mutateAsync({ status: "PENDING", source: "MANUAL", customerName: String(data.get("customerName") ?? ""), customerPhone: String(data.get("customerPhone") ?? ""), address: String(data.get("address") ?? ""), district: String(data.get("district") ?? "") || null, items: [{ productId, quantity: Number(data.get("quantity") ?? 1) }], paymentMethod: "COD" });
      toast.success(t("saved")); router.push(`/dashboard/orders/${order.id}`);
    } catch { toast.error(t("saveError")); }
  };
  return <form onSubmit={submit} className="mx-auto max-w-2xl space-y-5 rounded-2xl border bg-card p-5"><h1 className="text-xl font-semibold">{t("newOrder")}</h1><label className="block space-y-2"><span>{t("customerName")}</span><input name="customerName" required className="h-11 w-full rounded-lg border bg-background px-3" /></label><label className="block space-y-2"><span>{t("phone")}</span><input name="customerPhone" required inputMode="tel" className="h-11 w-full rounded-lg border bg-background px-3" /></label><label className="block space-y-2"><span>{t("address")}</span><textarea name="address" required className="min-h-24 w-full rounded-lg border bg-background p-3" /></label><label className="block space-y-2"><span>{t("district")}</span><input name="district" className="h-11 w-full rounded-lg border bg-background px-3" /></label><div className="grid gap-3 sm:grid-cols-[1fr_120px]"><label className="block space-y-2"><span>{t("product")}</span><select name="productId" required className="h-11 w-full rounded-lg border bg-background px-3"><option value="">{t("selectProduct")}</option>{products.data?.data.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label><label className="block space-y-2"><span>{t("quantity")}</span><input name="quantity" type="number" min="1" defaultValue="1" required className="h-11 w-full rounded-lg border bg-background px-3" /></label></div><button disabled={mutation.isPending || products.isPending} className="min-h-11 rounded-lg bg-primary px-5 font-semibold text-primary-foreground">{mutation.isPending ? t("saving") : t("save")}</button></form>;
}
