"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import { Field } from "@/components/common/Field";
import {
  useBookShipment,
  useCourierLocations,
  useCouriers,
} from "@/hooks/queries/useCouriers";
import type { OrderDTO, OrderListItemDTO } from "@/types/order";

interface BookShipmentDialogProps {
  order: OrderDTO | OrderListItemDTO;
  open: boolean;
  onClose: () => void;
  onBooked?: () => void;
}

export function BookShipmentDialog({
  order,
  open,
  onClose,
  onBooked,
}: BookShipmentDialogProps) {
  const t = useTranslations("shipments.book");
  const { data: couriers, isPending: couriersLoading } = useCouriers();
  const bookMutation = useBookShipment();

  const activeCouriers = couriers?.filter((c) => c.isActive) || [];
  const defaultCourier =
    activeCouriers.find((c) => c.isDefault) ||
    activeCouriers.find((c) => c.provider === "STEADFAST") ||
    activeCouriers[0];

  const [selectedCourierId, setSelectedCourierId] = useState<string>("");
  const [codAmountTaka, setCodAmountTaka] = useState<string>(
    String(Math.round(order.codAmountPaisa / 100)),
  );
  const [weightKg, setWeightKg] = useState<string>("0.5");
  const [note, setNote] = useState<string>("");
  const [itemDescription, setItemDescription] = useState<string>(
    "Clothing / Fashion Items",
  );

  // Pathao location states
  const [pathaoCityId, setPathaoCityId] = useState<number | null>(null);
  const [pathaoZoneId, setPathaoZoneId] = useState<number | null>(null);
  const [pathaoAreaId, setPathaoAreaId] = useState<number | null>(null);

  // RedX location states
  const [redxAreaId, setRedxAreaId] = useState<number | null>(null);
  const [redxAreaName, setRedxAreaName] = useState<string>("");

  const effectiveCourierId = selectedCourierId || defaultCourier?.id || "";
  const currentCourier = activeCouriers.find(
    (c) => c.id === effectiveCourierId,
  );

  // Location queries
  const isPathao = currentCourier?.provider === "PATHAO";
  const isRedx = currentCourier?.provider === "REDX";

  const { data: pathaoCities } = useCourierLocations(
    isPathao ? effectiveCourierId : null,
    "city",
  );

  const { data: pathaoZones } = useCourierLocations(
    isPathao && pathaoCityId ? effectiveCourierId : null,
    "zone",
    pathaoCityId || undefined,
  );

  const { data: pathaoAreas } = useCourierLocations(
    isPathao && pathaoZoneId ? effectiveCourierId : null,
    "area",
    pathaoZoneId || undefined,
  );

  const { data: redxAreas } = useCourierLocations(
    isRedx ? effectiveCourierId : null,
    "area",
    undefined,
    order.district || undefined,
  );

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveCourierId) {
      toast.error(t("selectCourierError"));
      return;
    }

    if (isPathao && (!pathaoCityId || !pathaoZoneId)) {
      toast.error(t("pathaoLocationRequired"));
      return;
    }

    if (isRedx && (!redxAreaId || !redxAreaName)) {
      toast.error(t("redxAreaRequired"));
      return;
    }

    const codPaisa = Math.round(Number(codAmountTaka || 0) * 100);
    const weight = Number(weightKg || 0.5);

    try {
      const result = await bookMutation.mutateAsync({
        orderId: order.id,
        courierConnectionId: effectiveCourierId,
        codAmountPaisa: codPaisa,
        weightKg: weight,
        note: note.trim() || undefined,
        itemDescription: itemDescription.trim() || undefined,
        pathao:
          isPathao && pathaoCityId && pathaoZoneId
            ? {
                cityId: pathaoCityId,
                zoneId: pathaoZoneId,
                areaId: pathaoAreaId || null,
              }
            : undefined,
        redx:
          isRedx && redxAreaId && redxAreaName
            ? {
                areaId: redxAreaId,
                areaName: redxAreaName,
              }
            : undefined,
      });

      toast.success(
        t("bookedSuccess", {
          tracking: result.trackingCode || result.consignmentId || "",
        }),
      );
      onClose();
      onBooked?.();
    } catch {
      toast.error(t("bookingFailed"));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border bg-card p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackageCheck className="text-primary" size={22} />
            <h2 className="text-xl font-semibold">{t("title")}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
          >
            ✕
          </button>
        </div>

        {/* Order Info Summary */}
        <div className="mb-5 rounded-xl border bg-muted/30 p-3.5 text-sm">
          <div className="flex justify-between font-semibold">
            <span>{order.orderNumber}</span>
            <span>{order.customerName}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {order.customerPhone}
          </p>
          {"address" in order && order.address ? (
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
              {order.address}
            </p>
          ) : null}
          {order.district && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("district")}: {order.district}
            </p>
          )}
        </div>

        {/* Risk Warning if Medium or High */}
        {order.riskLevel &&
          (order.riskLevel === "HIGH" || order.riskLevel === "MEDIUM") && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-warning/30 bg-warning-soft p-3 text-xs text-warning">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">
                  {t("riskAlertTitle", { level: order.riskLevel })}
                </p>
                <p className="mt-0.5">{t("riskAlertDescription")}</p>
              </div>
            </div>
          )}

        {couriersLoading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t("loadingCouriers")}
          </p>
        ) : activeCouriers.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center">
            <p className="font-medium text-sm">{t("noCouriersConnected")}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("connectCourierFirst")}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                {t("selectCourier")}
              </label>
              <select
                value={effectiveCourierId}
                onChange={(e) => {
                  setSelectedCourierId(e.target.value);
                  setPathaoCityId(null);
                  setPathaoZoneId(null);
                  setPathaoAreaId(null);
                  setRedxAreaId(null);
                  setRedxAreaName("");
                }}
                className="h-11 w-full rounded-lg border bg-card px-3 text-sm focus:border-primary outline-none"
                required
              >
                {activeCouriers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.provider}){" "}
                    {c.isDefault ? `[${t("default")}]` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label={t("codAmountTaka")}
                type="number"
                value={codAmountTaka}
                onChange={(e) => setCodAmountTaka(e.target.value)}
                placeholder="0"
                required
              />
              <Field
                label={t("weightKg")}
                type="number"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="0.5"
                required
              />
            </div>

            {/* Pathao cascaded dropdowns */}
            {isPathao && (
              <div className="space-y-3 rounded-xl border bg-muted/20 p-3.5">
                <p className="font-semibold text-xs text-primary">
                  {t("pathaoLocationTitle")}
                </p>
                <div>
                  <label className="mb-1 block text-xs font-medium">
                    {t("city")}
                  </label>
                  <select
                    value={pathaoCityId || ""}
                    onChange={(e) => {
                      setPathaoCityId(
                        e.target.value ? Number(e.target.value) : null,
                      );
                      setPathaoZoneId(null);
                      setPathaoAreaId(null);
                    }}
                    className="h-10 w-full rounded-lg border bg-card px-3 text-sm focus:border-primary outline-none"
                    required
                  >
                    <option value="">{t("selectCity")}</option>
                    {pathaoCities?.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium">
                    {t("zone")}
                  </label>
                  <select
                    value={pathaoZoneId || ""}
                    disabled={!pathaoCityId}
                    onChange={(e) => {
                      setPathaoZoneId(
                        e.target.value ? Number(e.target.value) : null,
                      );
                      setPathaoAreaId(null);
                    }}
                    className="h-10 w-full rounded-lg border bg-card px-3 text-sm focus:border-primary outline-none disabled:opacity-50"
                    required
                  >
                    <option value="">{t("selectZone")}</option>
                    {pathaoZones?.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium">
                    {t("area")} ({t("optional")})
                  </label>
                  <select
                    value={pathaoAreaId || ""}
                    disabled={!pathaoZoneId}
                    onChange={(e) => {
                      setPathaoAreaId(
                        e.target.value ? Number(e.target.value) : null,
                      );
                    }}
                    className="h-10 w-full rounded-lg border bg-card px-3 text-sm focus:border-primary outline-none disabled:opacity-50"
                  >
                    <option value="">{t("selectArea")}</option>
                    {pathaoAreas?.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* RedX Area select */}
            {isRedx && (
              <div className="space-y-3 rounded-xl border bg-muted/20 p-3.5">
                <p className="font-semibold text-xs text-primary">
                  {t("redxLocationTitle")}
                </p>
                <div>
                  <label className="mb-1 block text-xs font-medium">
                    {t("redxArea")}
                  </label>
                  <select
                    value={redxAreaId || ""}
                    onChange={(e) => {
                      const areaId = e.target.value
                        ? Number(e.target.value)
                        : null;
                      setRedxAreaId(areaId);
                      const areaObj = redxAreas?.find((a) => a.id === areaId);
                      setRedxAreaName(areaObj?.name || "");
                    }}
                    className="h-10 w-full rounded-lg border bg-card px-3 text-sm focus:border-primary outline-none"
                    required
                  >
                    <option value="">{t("selectRedxArea")}</option>
                    {redxAreas?.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <Field
              label={t("itemDescription")}
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              placeholder="e.g. Cotton Dress"
            />

            <Field
              label={t("noteToCourier")}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("notePlaceholder")}
            />

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                disabled={bookMutation.isPending}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                disabled={bookMutation.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <PackageCheck size={16} />
                {bookMutation.isPending ? t("booking") : t("confirmBooking")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
