export type CourierProvider = "STEADFAST" | "PATHAO" | "REDX" | "MANUAL";

export type ShipmentStatus =
  | "CREATED"
  | "PICKUP_PENDING"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "PARTIAL_DELIVERED"
  | "ON_HOLD"
  | "RETURNING"
  | "RETURNED"
  | "CANCELLED"
  | "UNKNOWN";

export type ShipmentEventSource = "WEBHOOK" | "SYNC" | "MANUAL" | "SYSTEM";

export interface CourierConnectionDTO {
  id: string;
  provider: CourierProvider;
  name: string;
  isDefault: boolean;
  isActive: boolean;
  settings: Record<string, unknown> | null;
  maskedKey: string | null;
  webhookUrl: string;
  lastVerifiedAt: string | null;
  lastError: string | null;
  createdAt: string;
}

export interface CourierLocationDTO {
  id: number;
  name: string;
}

export interface ShipmentEventDTO {
  id: string;
  status: ShipmentStatus;
  rawStatus: string | null;
  message: string | null;
  source: ShipmentEventSource;
  occurredAt: string;
}

export interface ShipmentSummaryDTO {
  id: string;
  provider: CourierProvider;
  courierName: string | null;
  consignmentId: string | null;
  trackingCode: string | null;
  trackingUrl: string | null;
  status: ShipmentStatus;
}

export interface ShipmentDTO extends ShipmentSummaryDTO {
  orderId: string;
  orderNumber: string;
  customerName: string;
  rawStatus: string | null;
  codAmountPaisa: number;
  collectedAmountPaisa: number | null;
  courierChargePaisa: number | null;
  codChargePaisa: number | null;
  isActive: boolean;
  bookedAt: string;
  lastSyncedAt: string | null;
  deliveredAt: string | null;
  returnedAt: string | null;
  paidOutAt: string | null;
  error: string | null;
  events: ShipmentEventDTO[];
}

export interface BulkResultDTO {
  succeeded: string[];
  failed: { id: string; code: string; message: string }[];
}

export interface CreateCourierConnectionInput {
  provider: CourierProvider;
  name: string;
  credentials: Record<string, unknown>;
  settings?: Record<string, unknown>;
  isDefault?: boolean;
}

export interface UpdateCourierConnectionInput {
  name?: string;
  credentials?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface BookShipmentInput {
  orderId: string;
  courierConnectionId: string;
  codAmountPaisa?: number;
  note?: string | null;
  weightKg?: number;
  itemDescription?: string | null;
  pathao?: {
    cityId: number;
    zoneId: number;
    areaId?: number | null;
    storeId?: number;
  };
  redx?: {
    areaId: number;
    areaName: string;
    declaredValueTaka?: number;
    pickupStoreId?: number;
  };
}

export interface BulkBookShipmentInput {
  orderIds: string[];
  courierConnectionId: string;
}

export interface ManualShipmentInput {
  orderId: string;
  courierName: string;
  trackingCode?: string;
  codAmountPaisa?: number;
}

export interface UpdateManualStatusInput {
  status:
    "DELIVERED" | "PARTIAL_DELIVERED" | "RETURNED" | "IN_TRANSIT" | "ON_HOLD";
  collectedAmountPaisa?: number;
  note?: string;
}

export interface CancelShipmentInput {
  reason?: string;
}

export interface ShipmentListQuery {
  page?: number;
  limit?: number;
  status?: string;
  provider?: CourierProvider;
  courierId?: string;
  active?: boolean;
  from?: string;
  to?: string;
  search?: string;
}
