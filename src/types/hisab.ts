export type PartyKind = "CUSTOMER" | "SUPPLIER" | "OTHER";
export type LedgerDirection = "GAVE" | "GOT";
export type LedgerMethod = "CASH" | "BKASH" | "NAGAD" | "ROCKET" | "BANK" | "CARD" | "COURIER" | "GOODS" | "ADJUSTMENT";

export interface MoneyAccountDTO {
  id: string; kind: "CASH" | "MFS" | "BANK" | "COURIER"; name: string; courierConnectionId: string | null;
  isDefault: boolean; openingBalancePaisa: number; balancePaisa: number; isArchived: boolean; sortOrder: number;
}
export interface HisabSummaryDTO {
  totalReceivablePaisa: number; totalPayablePaisa: number; todaySalesPaisa: number; todayCollectionPaisa: number;
  todayExpensePaisa: number; courierHoldingPaisa: number; cashInHandPaisa: number; accounts: MoneyAccountDTO[];
}
export interface PartyDTO {
  id: string; kind: PartyKind; name: string; phone: string | null; address: string | null; customerId: string | null;
  openingBalancePaisa: number; openingDate: string; balancePaisa: number; creditLimitPaisa: number | null;
  reminderOptOut: boolean; lastEntryAt: string | null; archivedAt: string | null; createdAt: string;
}
export interface LedgerEntryDTO {
  id: string; partyId: string; direction: LedgerDirection; amountPaisa: number; entryDate: string; note: string | null;
  method: LedgerMethod; moneyAccount: { id: string; name: string } | null; source: string; sourceId: string | null;
  sourceLabel: string | null; isAuto: boolean; attachmentUrl: string | null; runningBalancePaisa: number;
  createdBy: { id: string; name: string } | null; createdAt: string;
}
export interface CashEntryDTO {
  id: string; moneyAccount: { id: string; name: string; kind: MoneyAccountDTO["kind"] }; direction: "IN" | "OUT";
  amountPaisa: number; category: string; expenseCategory: { id: string; nameEn: string; nameBn: string } | null;
  party: { id: string; name: string } | null; transferGroupId: string | null; source: string; sourceId: string | null;
  sourceLabel: string | null; isAuto: boolean; entryDate: string; note: string | null;
  createdBy: { id: string; name: string } | null; createdAt: string;
}
export interface ExpenseCategoryDTO { id: string; nameEn: string; nameBn: string; isDefault: boolean; isArchived: boolean; sortOrder: number }
export interface ReminderDTO {
  id: string; partyId: string; channel: "SMS" | "WHATSAPP_LINK"; message: string; phone: string | null;
  balanceSnapshotPaisa: number; status: string; error: string | null; whatsappUrl: string | null; sentAt: string | null; createdAt: string;
}
export interface PartyStatementDTO {
  shop: { name: string; phone: string | null; address: string | null; logoUrl: string | null };
  party: PartyDTO; from: string; to: string; openingBalancePaisa: number; closingBalancePaisa: number;
  totals: { gavePaisa: number; gotPaisa: number }; entries: LedgerEntryDTO[]; showBranding: boolean;
}
export interface HisabReportDTO {
  from: string; to: string;
  days: { date: string; salesPaisa: number; cashInPaisa: number; cashOutPaisa: number; expensePaisa: number }[];
  totals: { salesPaisa: number; cashInPaisa: number; cashOutPaisa: number; expensePaisa: number; dueCollectedPaisa: number };
  expensesByCategory: { categoryId: string | null; nameEn: string; nameBn: string; amountPaisa: number }[];
}
