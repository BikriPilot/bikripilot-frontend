import type { ShipmentSummaryDTO } from "@/types/courier";

export type OrderStatus =
  | "DRAFT"
  | "PENDING"
  | "CONFIRMED"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED"
  | "PARTIALLY_DELIVERED"
  | "RETURNED"
  | "CANCELLED";
export type OrderSource =
  | "MESSENGER"
  | "INSTAGRAM"
  | "WHATSAPP"
  | "COMMENT"
  | "MANUAL"
  | "PHONE"
  | "WEBSITE";
export type PaymentMethod =
  "COD" | "BKASH" | "NAGAD" | "ROCKET" | "BANK" | "CARD" | "CASH";
export type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID";

export interface OrderItemDTO {
  id: string;
  productId: string | null;
  variantId: string | null;
  productName: string;
  variantName: string | null;
  sku: string | null;
  unitPricePaisa: number;
  quantity: number;
  lineTotalPaisa: number;
  image: string | null;
}
export interface OrderListItemDTO {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  source: OrderSource;
  customerName: string;
  customerPhone: string;
  district: string | null;
  totalPaisa: number;
  codAmountPaisa: number;
  paymentStatus: PaymentStatus;
  itemCount: number;
  firstItemName: string | null;
  readinessScore: number;
  isDuplicateSuspect: boolean;
  riskLevel: string | null;
  shipment: ShipmentSummaryDTO | null;
  createdAt: string;
}
export interface OrderDTO extends OrderListItemDTO {
  advanceRequired: boolean;
  requiredAdvancePaisa: number;
  paymentTransactionId: string | null;
  paymentSenderPhone: string | null;
  customerId: string;
  conversationId: string | null;
  customerAltPhone: string | null;
  address: string;
  area: string | null;
  deliveryZone: string;
  items: OrderItemDTO[];
  subtotalPaisa: number;
  discountPaisa: number;
  deliveryChargePaisa: number;
  advancePaidPaisa: number;
  paymentMethod: PaymentMethod;
  note: string | null;
  internalNote: string | null;
  missingFields: string[];
  duplicateOfOrderId: string | null;
  riskScore: number | null;
  aiExtracted: boolean;
  aiExtractedFields: string[];
  activeShipment: ShipmentSummaryDTO | null;
  statusEvents: {
    id: string;
    fromStatus: OrderStatus | null;
    toStatus: OrderStatus;
    source: string;
    note: string | null;
    createdAt: string;
  }[];
  allowedTransitions: OrderStatus[];
  createdAt: string;
  updatedAt: string;
  confirmedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  returnedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
}
export interface OrderTotalsDTO {
  subtotalPaisa: number;
  discountPaisa: number;
  deliveryChargePaisa: number;
  totalPaisa: number;
  advancePaidPaisa: number;
  codAmountPaisa: number;
  readinessScore: number;
  missingFields: string[];
}
export interface PublicTrackingDTO {
  shopName: string;
  shopLogoUrl: string | null;
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  items: { name: string; variantName: string | null; quantity: number }[];
  totalPaisa: number;
  codAmountPaisa: number;
  timeline: { status: OrderStatus; at: string }[];
  shipment: {
    status: string;
    trackingCode: string | null;
    events: { status: string; message: string | null; occurredAt: string }[];
  } | null;
  showBranding: boolean;
}
