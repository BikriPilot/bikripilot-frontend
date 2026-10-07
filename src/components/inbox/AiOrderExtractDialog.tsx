"use client";

import { useState } from "react";
import {
  Sparkles,
  X,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  User,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useInboxMutations } from "@/hooks/queries/useInbox";
import { useOrderMutations } from "@/hooks/queries/useOrders";
import { formatMoney } from "@/lib/money";
import type { AiOrderExtractionDTO } from "@/types/ai";

interface AiOrderExtractDialogProps {
  open: boolean;
  onClose: () => void;
  conversationId: string;
  customerId?: string;
}

export function AiOrderExtractDialog({
  open,
  onClose,
  conversationId,
  customerId,
}: AiOrderExtractDialogProps) {
  const t = useTranslations("inbox");
  const router = useRouter();
  const inboxMutations = useInboxMutations(conversationId);
  const orderMutations = useOrderMutations();

  const [extraction, setExtraction] = useState<AiOrderExtractionDTO | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  if (!open) return null;

  const handleExtract = async () => {
    setIsExtracting(true);
    try {
      const data = await inboxMutations.extractOrderWithAi.mutateAsync(false);
      setExtraction(data);
      toast.success(t("orderExtractedSuccess"));
    } catch {
      toast.error(t("orderExtractionFailed"));
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!extraction) return;

    if (!extraction.customerName || !extraction.phone || !extraction.address) {
      toast.error(t("missingRequiredOrderFields"));
      return;
    }

    if (extraction.items.length === 0) {
      toast.error(t("noItemsToCreateOrder"));
      return;
    }

    setIsCreatingOrder(true);
    try {
      const created = await orderMutations.create.mutateAsync({
        status: "DRAFT",
        source: "MESSENGER",
        conversationId,
        customerId: customerId || undefined,
        customerName: extraction.customerName,
        customerPhone: extraction.phone,
        customerAltPhone: extraction.altPhone || undefined,
        address: extraction.address,
        district: extraction.district || undefined,
        area: extraction.area || undefined,
        deliveryZone: extraction.deliveryZone || "INSIDE_DHAKA",
        items: extraction.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId || undefined,
          quantity: item.quantity,
          unitPricePaisa: item.unitPricePaisa,
        })),
        note: extraction.note || undefined,
        aiRunId: extraction.aiRunId,
        aiExtractedFields: extraction.extractedFields,
      });

      toast.success(t("draftOrderCreated"));
      onClose();
      router.push(`/dashboard/orders/${created.id}`);
    } catch {
      toast.error(t("draftOrderCreateFailed"));
    } finally {
      setIsCreatingOrder(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border bg-card shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">
                {t("aiOrderExtraction")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t("extractOrderFromConversationDesc")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {!extraction && (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
              <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                <Sparkles size={24} />
              </div>
              <div className="max-w-xs space-y-1">
                <h4 className="font-semibold text-foreground">
                  {t("extractOrderReadyTitle")}
                </h4>
                <p className="text-muted-foreground text-xs">
                  {t("extractOrderReadyDesc")}
                </p>
              </div>
              <button
                type="button"
                onClick={handleExtract}
                disabled={isExtracting}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
              >
                {isExtracting ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Sparkles size={15} />
                )}
                <span>{t("startAiExtraction")}</span>
              </button>
            </div>
          )}

          {extraction && (
            <div className="space-y-4">
              {/* Confidence & Status */}
              <div className="flex items-center justify-between rounded-xl bg-muted/60 p-3">
                <span className="font-medium text-muted-foreground">
                  {t("aiConfidenceScore")}
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 font-mono font-semibold ${
                    extraction.confidence >= 0.8
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {Math.round(extraction.confidence * 100)}%
                </span>
              </div>

              {/* Missing Fields Warning */}
              {extraction.missingFields.length > 0 && (
                <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-3 text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <AlertTriangle size={14} className="text-amber-600" />
                    <span>{t("missingFieldsWarning")}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {extraction.missingFields.map((f) => (
                      <span
                        key={f.field}
                        className="rounded bg-amber-200/70 px-1.5 py-0.5 text-[11px] font-medium"
                      >
                        {f.labelEn}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Details */}
              <div className="rounded-xl border bg-background p-3.5 space-y-2.5">
                <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                  <User size={14} className="text-primary" />
                  <span>{t("customerInfo")}</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground block">{t("name")}:</span>
                    <span className="font-medium text-foreground">
                      {extraction.customerName || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">{t("phone")}:</span>
                    <span className="font-medium font-mono text-foreground">
                      {extraction.phone || "-"}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">{t("address")}:</span>
                  <span className="font-medium text-foreground text-[11px]">
                    {extraction.address || "-"}
                  </span>
                </div>
                {(extraction.district || extraction.deliveryZone) && (
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t">
                    <div>
                      <span className="text-muted-foreground block">{t("district")}:</span>
                      <span className="font-medium text-foreground">
                        {extraction.district || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">{t("deliveryZone")}:</span>
                      <span className="font-medium text-foreground">
                        {extraction.deliveryZone || "-"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Extracted Items */}
              <div className="rounded-xl border bg-background p-3.5 space-y-2.5">
                <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                  <ShoppingBag size={14} className="text-primary" />
                  <span>{t("extractedItems")} ({extraction.items.length})</span>
                </h4>
                {extraction.items.length === 0 ? (
                  <p className="text-muted-foreground text-[11px] italic">
                    {t("noItemsRecognized")}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {extraction.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg bg-muted/40 p-2 text-[11px]"
                      >
                        <div>
                          <p className="font-medium text-foreground">{item.productName}</p>
                          {item.variantName && (
                            <p className="text-muted-foreground text-[10px]">
                              {item.variantName}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">
                            {formatMoney(item.unitPricePaisa * item.quantity)}
                          </p>
                          <p className="text-muted-foreground text-[10px]">
                            Qty: {item.quantity} × {formatMoney(item.unitPricePaisa)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Unmatched items */}
              {extraction.unmatchedItems.length > 0 && (
                <div className="rounded-xl border border-dashed bg-muted/20 p-3 space-y-1">
                  <span className="font-medium text-muted-foreground block">
                    {t("unmatchedItemsNotice")}:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {extraction.unmatchedItems.map((u, i) => (
                      <span
                        key={i}
                        className="rounded bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                      >
                        {u.text} (x{u.quantity})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {extraction && (
          <div className="flex items-center justify-end gap-2 border-t px-5 py-3 bg-muted/20">
            <button
              type="button"
              onClick={handleExtract}
              disabled={isExtracting || isCreatingOrder}
              className="rounded-lg border px-3 py-1.5 font-medium text-xs hover:bg-muted transition-colors disabled:opacity-50"
            >
              {isExtracting ? (
                <Loader2 size={13} className="animate-spin inline mr-1" />
              ) : null}
              {t("reExtract")}
            </button>
            <button
              type="button"
              onClick={handleCreateOrder}
              disabled={isCreatingOrder || isExtracting || extraction.items.length === 0}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 font-medium text-xs text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs disabled:opacity-50"
            >
              {isCreatingOrder ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <CheckCircle2 size={14} />
              )}
              <span>{t("createDraftOrder")}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
