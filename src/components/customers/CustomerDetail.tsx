"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Field, TextField } from "@/components/common/Field";
import { PageHeader } from "@/components/common/PageHeader";
import { ErrorState } from "@/components/common/PageStates";
import { DetailSkeleton } from "@/components/common/skeletons";
import { ShieldCheck } from "lucide-react";
import { RiskCheckDialog } from "@/components/risk/RiskCheckDialog";
import {
  useCustomer,
  useCustomerMutations,
} from "@/hooks/queries/useCustomers";
import { formatMoney } from "@/lib/money";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { customersApi } from "@/lib/api/customers.api";
import { formatDate } from "@/lib/date";
import { useRouter } from "next/navigation";
export function CustomerDetail({ id }: { id: string }) {
  const t = useTranslations("customers");
  const tRisk = useTranslations("risk");
  const query = useCustomer(id);
  const mutations = useCustomerMutations();
  const { can, shopId } = useCurrentShop();
  const writable = can("customer.write");
  const router = useRouter();
  const [blockReason, setBlockReason] = useState("");
  const [orderPage, setOrderPage] = useState(1);
  const orders = useQuery({
    queryKey: ["customers", shopId, id, "orders", orderPage],
    queryFn: () =>
      customersApi.orders(shopId!, id, { page: orderPage, limit: 10 }),
    enabled: Boolean(shopId) && can("order.read"),
  });
  const [editing, setEditing] = useState(false);
  const [riskDialogOpen, setRiskDialogOpen] = useState(false);
  if (query.isPending) return <DetailSkeleton />;
  if (query.isError || !query.data)
    return <ErrorState onRetry={() => void query.refetch()} />;
  const customer = query.data;
  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!writable || mutations.update.isPending) return;
    const form = new FormData(event.currentTarget);
    const optional = (key: string) =>
      String(form.get(key) ?? "").trim() || null;
    try {
      await mutations.update.mutateAsync({
        id,
        body: {
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
        },
      });
      setEditing(false);
      toast.success(t("saved"));
    } catch {
      toast.error(t("saveError"));
    }
  };
  const toggleBlock = async () => {
    if (!writable) return;
    try {
      await mutations.block.mutateAsync({
        id,
        blocked: !customer.isBlocked,
        reason: !customer.isBlocked
          ? blockReason.trim() || undefined
          : undefined,
      });
      toast.success(t("saved"));
    } catch {
      toast.error(t("saveError"));
    }
  };
  const remove = async () => {
    if (!writable || !window.confirm(t("deleteConfirm"))) return;
    try {
      await mutations.remove.mutateAsync(id);
      toast.success(t("deleted"));
      router.push("/dashboard/customers");
    } catch {
      toast.error(t("deleteError"));
    }
  };
  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.name ?? t("unnamed")}
        description={customer.phone ?? t("noPhone")}
        action={
          <div className="flex gap-2 flex-wrap">
            {customer.phone && can("risk.check") && (
              <button
                type="button"
                onClick={() => setRiskDialogOpen(true)}
                className="min-h-11 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted inline-flex items-center gap-1.5"
              >
                <ShieldCheck size={16} className="text-primary" />
                <span>{tRisk("checkButton")}</span>
              </button>
            )}
            {can("hisab.read") ? (
              <a
                href={`/dashboard/hisab?customerId=${id}`}
                className="min-h-11 rounded-lg border px-4 py-2 text-sm"
              >
                {t("openInHisab")}
              </a>
            ) : null}
            {writable ? (
              <>
                <button
                  onClick={toggleBlock}
                  className="min-h-11 rounded-lg border px-4 text-sm"
                >
                  {customer.isBlocked ? t("unblock") : t("block")}
                </button>
                <button
                  onClick={() => setEditing(!editing)}
                  className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
                >
                  {t("edit")}
                </button>
                <button
                  type="button"
                  disabled={mutations.remove?.isPending}
                  onClick={() => void remove()}
                  className="min-h-11 rounded-lg border px-3 text-danger"
                >
                  {t("delete")}
                </button>
              </>
            ) : null}
          </div>
        }
      />
      {writable && !customer.isBlocked ? (
        <Field
          label={t("blockReason")}
          value={blockReason}
          maxLength={500}
          onChange={(event) => setBlockReason(event.target.value)}
        />
      ) : null}
      {customer.isBlocked ? (
        <p role="status" className="text-danger">
          {t("blocked")}
          {customer.blockedReason ? `: ${customer.blockedReason}` : ""}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label={t("orders")} value={String(customer.totalOrders)} />
        <Stat label={t("delivered")} value={String(customer.deliveredOrders)} />
        <Stat
          label={t("spent")}
          value={formatMoney(customer.totalSpentPaisa)}
        />
      </div>
      {editing ? (
        <form
          onSubmit={save}
          className="grid gap-4 rounded-2xl border bg-card p-5 sm:grid-cols-2"
        >
          <Field
            name="name"
            label={t("name")}
            defaultValue={customer.name ?? ""}
          />
          <Field
            name="phone"
            label={t("phone")}
            defaultValue={customer.phone ?? ""}
          />
          <Field
            name="email"
            label={t("email")}
            defaultValue={customer.email ?? ""}
          />
          <Field
            name="altPhone"
            label={t("altPhone")}
            defaultValue={customer.altPhone ?? ""}
          />
          <Field
            name="district"
            label={t("district")}
            defaultValue={customer.district ?? ""}
          />
          <Field
            name="tags"
            label={t("tags")}
            defaultValue={customer.tags.join(", ")}
          />
          <Field
            name="area"
            label={t("area")}
            defaultValue={customer.area ?? ""}
          />
          <TextField
            name="address"
            label={t("address")}
            defaultValue={customer.address ?? ""}
          />
          <TextField
            name="notes"
            label={t("notes")}
            defaultValue={customer.notes ?? ""}
          />
          <button
            disabled={mutations.update.isPending}
            className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground sm:col-span-2"
          >
            {t("save")}
          </button>
        </form>
      ) : (
        <section className="grid gap-3 rounded-2xl border bg-card p-5 text-sm sm:grid-cols-2">
          <p>
            {t("email")}: {customer.email ?? "—"}
          </p>
          <p>
            {t("area")}: {customer.area ?? "—"}
          </p>
          <p>
            {t("address")}: {customer.address ?? "—"}
          </p>
          <p>
            {t("notes")}: {customer.notes ?? "—"}
          </p>
        </section>
      )}
      <RiskCheckDialog
        open={riskDialogOpen}
        onClose={() => setRiskDialogOpen(false)}
        phone={customer.phone ?? undefined}
      />
      {can("hisab.read") && customer.hisab ? (
        <section className="space-y-2 border-t pt-4">
          <h2 className="font-semibold">{t("openInHisab")}</h2>
          <p>{formatMoney(customer.hisab.balancePaisa)}</p>
          <Link
            href={`/dashboard/hisab/statement/${customer.hisab.partyId}`}
            className="inline-flex min-h-11 items-center text-primary"
          >
            {t("statement")}
          </Link>
        </section>
      ) : null}
      {can("inbox.read") && customer.conversationIds.length ? (
        <section className="space-y-2 border-t pt-4">
          <h2 className="font-semibold">{t("conversations")}</h2>
          {customer.conversationIds.map((conversationId, index) => (
            <Link
              key={conversationId}
              href={`/dashboard/inbox/${conversationId}`}
              className="mr-4 inline-flex min-h-11 items-center text-primary"
            >
              {t("conversation")} {index + 1}
            </Link>
          ))}
        </section>
      ) : null}
      {can("order.read") ? (
        <section className="space-y-3 border-t pt-4">
          <h2 className="font-semibold">{t("orders")}</h2>
          {orders.isPending ? (
            <DetailSkeleton />
          ) : orders.isError ? (
            <ErrorState onRetry={() => void orders.refetch()} />
          ) : (
            <>
              <div className="divide-y">
                {orders.data?.data.length === 0 ? (
                  <p className="py-3 text-sm text-muted-foreground">
                    {t("noOrders")}
                  </p>
                ) : null}
                {orders.data?.data.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-3"
                  >
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="font-semibold text-primary"
                    >
                      {order.orderNumber}
                    </Link>
                    <span className="text-sm">
                      {formatDate(order.createdAt)}
                    </span>
                    <span>{formatMoney(order.totalPaisa)}</span>
                  </div>
                ))}
              </div>
              {orders.data?.meta && orders.data.meta.totalPages > 1 ? (
                <div className="flex justify-between">
                  <button
                    type="button"
                    disabled={orderPage <= 1}
                    onClick={() => setOrderPage(orderPage - 1)}
                    className="min-h-11 border px-3"
                  >
                    {t("previous")}
                  </button>
                  <span>
                    {orderPage} / {orders.data.meta.totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={orderPage >= orders.data.meta.totalPages}
                    onClick={() => setOrderPage(orderPage + 1)}
                    className="min-h-11 border px-3"
                  >
                    {t("next")}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </section>
      ) : null}
    </div>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
