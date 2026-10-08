"use client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Field, TextField } from "@/components/common/Field";
import { PageHeader } from "@/components/common/PageHeader";
import { useCustomerMutations } from "@/hooks/queries/useCustomers";
import { useCurrentShop } from "@/hooks/useCurrentShop";
export function CustomerCreate() {
  const t = useTranslations("customers");
  const router = useRouter();
  const mutation = useCustomerMutations();
  const { can } = useCurrentShop();
  const writable = can("customer.write");
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!writable || mutation.create.isPending) return;
    const form = new FormData(event.currentTarget);
    const optional = (key: string) =>
      String(form.get(key) ?? "").trim() || null;
    try {
      const customer = await mutation.create.mutateAsync({
        name: optional("name"),
        phone: optional("phone"),
        altPhone: optional("altPhone"),
        email: optional("email"),
        address: optional("address"),
        area: optional("area"),
        district: optional("district"),
        tags: String(form.get("tags") ?? "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        notes: optional("notes"),
      });
      toast.success(t("saved"));
      router.push(`/dashboard/customers/${customer.id}`);
    } catch {
      toast.error(t("saveError"));
    }
  };
  return (
    <div className="space-y-6">
      <PageHeader title={t("add")} description={t("description")} />
      <form
        onSubmit={submit}
        className="grid gap-4 rounded-2xl border bg-card p-5 sm:grid-cols-2"
      >
        <Field name="name" label={t("name")} autoFocus />
        <Field name="phone" label={t("phone")} />
        <Field name="altPhone" label={t("altPhone")} />
        <Field name="email" label={t("email")} type="email" />
        <Field name="area" label={t("area")} />
        <Field name="district" label={t("district")} />
        <Field name="tags" label={t("tags")} />
        <TextField name="address" label={t("address")} />
        <TextField name="notes" label={t("notes")} />
        <button
          disabled={!writable || mutation.create.isPending}
          className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground sm:col-span-2"
        >
          {t("save")}
        </button>
      </form>
    </div>
  );
}
