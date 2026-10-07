"use client";

import { useState } from "react";
import {
  Phone,
  ShoppingBag,
  FileText,
  Plus,
  ExternalLink,
  X,
  User,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useConversationOrders } from "@/hooks/queries/useInbox";
import { formatMoney } from "@/lib/money";
import { NotesPanel } from "./NotesPanel";
import { CreateOrderSheet } from "./CreateOrderSheet";
import type { ConversationDTO } from "@/types/inbox";

interface CustomerPanelProps {
  conversation: ConversationDTO;
  isOpen: boolean;
  onClose?: () => void;
  isMobileOrDrawer?: boolean;
}

export function CustomerPanel({
  conversation,
  isOpen,
  onClose,
  isMobileOrDrawer = false,
}: CustomerPanelProps) {
  const t = useTranslations("inbox");
  const [activeTab, setActiveTab] = useState<"orders" | "notes">("orders");
  const [createOrderOpen, setCreateOrderOpen] = useState(false);

  const { data: pastOrders = [], isLoading: loadingOrders } =
    useConversationOrders(conversation.id);

  const customer = conversation.customer;

  const content = (
    <div className="flex h-full flex-col overflow-y-auto bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h3 className="font-semibold text-foreground">{t("customerDetails")}</h3>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="p-5 space-y-5 flex-1">
        {/* Customer Profile Card */}
        <div className="flex flex-col items-center text-center space-y-2 pb-2">
          {customer.profilePicUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={customer.profilePicUrl}
              alt={customer.name ?? "Customer"}
              className="size-16 rounded-full object-cover border-2 border-primary/20"
            />
          ) : (
            <div className="grid size-16 place-items-center rounded-full bg-primary-soft text-primary font-bold text-xl">
              {customer.name?.charAt(0).toUpperCase() ?? <User size={28} />}
            </div>
          )}

          <div>
            <h4 className="font-semibold text-base text-foreground">
              {customer.name ?? t("guestCustomer")}
            </h4>
            <p className="text-xs text-muted-foreground">{conversation.channel.name}</p>
          </div>

          {customer.phone && (
            <a
              href={`tel:${customer.phone}`}
              className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Phone size={12} className="text-primary" />
              <span>{customer.phone}</span>
            </a>
          )}
        </div>

        {/* Quick action: Create Order */}
        <button
          type="button"
          onClick={() => setCreateOrderOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 shadow-xs"
        >
          <Plus size={15} />
          <span>{t("createOrder")}</span>
        </button>

        {/* Tabs: Orders / Notes */}
        <div className="border-b">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-1.5 pb-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === "orders"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShoppingBag size={14} />
              <span>{t("pastOrders")}</span>
              <span className="ml-1 rounded-full bg-muted px-1.5 py-0.2 text-[10px]">
                {pastOrders.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("notes")}
              className={`flex items-center gap-1.5 pb-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === "notes"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText size={14} />
              <span>{t("notes")}</span>
            </button>
          </div>
        </div>

        {/* Tab content */}
        <div>
          {activeTab === "orders" ? (
            <div className="space-y-2.5">
              {loadingOrders ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  {t("loading")}...
                </div>
              ) : pastOrders.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  {t("noOrders")}
                </div>
              ) : (
                pastOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/dashboard/orders/${order.id}`}
                    className="flex items-center justify-between rounded-xl border bg-background p-3 text-xs hover:border-primary/50 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {order.orderNumber}
                        </span>
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {order.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {order.firstItemName ?? t("orderItemsCount", { count: order.itemCount })}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-semibold text-foreground">
                        ৳{formatMoney(order.totalPaisa)}
                      </span>
                      <ExternalLink size={12} className="ml-auto mt-1 text-muted-foreground" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          ) : (
            <NotesPanel conversationId={conversation.id} />
          )}
        </div>
      </div>

      <CreateOrderSheet
        open={createOrderOpen}
        onClose={() => setCreateOrderOpen(false)}
        customerName={customer.name}
        customerPhone={customer.phone}
        customerId={customer.id}
        conversationId={conversation.id}
      />
    </div>
  );

  if (isMobileOrDrawer) {
    if (!isOpen) return null;
    return (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs md:items-center md:justify-end"
        onClick={onClose}
      >
        <div
          className="h-[85vh] w-full rounded-t-2xl border-t bg-card md:h-full md:max-w-sm md:rounded-none md:border-l md:border-t-0"
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <aside className="w-[340px] shrink-0 border-l bg-card">
      {content}
    </aside>
  );
}
