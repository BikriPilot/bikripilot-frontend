import type { CourierProvider, ShipmentDTO } from "@/types/courier";

export type PayoutStatus = "DRAFT" | "MATCHED" | "MISMATCH" | "CONFIRMED";
export type PayoutMatchStatus =
  "MATCHED" | "AMOUNT_MISMATCH" | "NOT_FOUND" | "DUPLICATE";

export interface PayoutItemDTO {
  id: string;
  consignmentId: string;
  shipmentId: string | null;
  orderId: string | null;
  orderNumber: string | null;
  codCollectedPaisa: number;
  courierChargePaisa: number;
  codChargePaisa: number;
  netPaisa: number;
  expectedCodPaisa: number | null;
  matchStatus: PayoutMatchStatus;
  note: string | null;
}

export interface PayoutDTO {
  id: string;
  provider: CourierProvider;
  courierConnection: { id: string; name: string } | null;
  reference: string | null;
  payoutDate: string;
  receivedAmountPaisa: number;
  expectedAmountPaisa: number;
  differencePaisa: number;
  status: PayoutStatus;
  moneyAccount: { id: string; name: string };
  note: string | null;
  itemCount: number;
  confirmedAt: string | null;
  createdAt: string;
  items?: PayoutItemDTO[];
}

export interface ReconciliationSummaryDTO {
  couriers: {
    courierConnectionId: string;
    name: string;
    provider: CourierProvider;
    holdingPaisa: number;
    deliveredUnpaidCount: number;
    deliveredUnpaidCodPaisa: number;
    oldestUnpaidDeliveredAt: string | null;
  }[];
  mismatchedPayouts: number;
}

export interface PayoutLineInput {
  consignmentId: string;
  codCollectedPaisa: number;
  courierChargePaisa?: number;
  codChargePaisa?: number;
  note?: string | null;
}

export interface PayoutCreateInput {
  courierConnectionId?: string;
  provider: CourierProvider;
  reference?: string;
  payoutDate: string;
  receivedAmountPaisa: number;
  moneyAccountId: string;
  note?: string;
  items: PayoutLineInput[];
}

export type PayoutImportInput = Omit<PayoutCreateInput, "items">;
export type PayoutListQuery = {
  courierConnectionId?: string;
  status?: PayoutStatus;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};
export type UnpaidShipmentQuery = {
  courierConnectionId?: string;
  page?: number;
  limit?: number;
};
export type UnpaidShipmentPage = { data: ShipmentDTO[]; meta: PageMeta };
export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
