import { api } from "./client";
import type { CashEntryDTO, ExpenseCategoryDTO, HisabReportDTO, HisabSummaryDTO, LedgerEntryDTO, MoneyAccountDTO, PartyDTO, PartyStatementDTO, ReminderDTO } from "@/types/hisab";
import type { PageMeta } from "@/types/product";
const path = (shopId: string, suffix: string) => `/shops/${shopId}/hisab${suffix}`;
export const hisabApi = {
  summary: (shopId: string) => api.get<{ data: HisabSummaryDTO }>(path(shopId, "/summary")).then(r => r.data.data),
  parties: (shopId: string, params: Record<string, string | number | boolean | undefined>) => api.get<{ data: PartyDTO[]; meta: PageMeta }>(path(shopId, "/parties"), { params }).then(r => r.data),
  createParty: (shopId: string, body: Partial<PartyDTO> & { kind: string; name: string }) => api.post<{ data: PartyDTO }>(path(shopId, "/parties"), body).then(r => r.data.data),
  entries: (shopId: string, partyId: string) => api.get<{ data: LedgerEntryDTO[]; meta: PageMeta }>(path(shopId, `/parties/${partyId}/entries`), { params: { page: 1, limit: 100 } }).then(r => r.data),
  createEntry: (shopId: string, partyId: string, body: Record<string, unknown>) => api.post<{ data: LedgerEntryDTO }>(path(shopId, `/parties/${partyId}/entries`), body).then(r => r.data.data),
  accounts: (shopId: string) => api.get<{ data: MoneyAccountDTO[] }>(path(shopId, "/accounts"), { params: { archived: false } }).then(r => r.data.data),
  cashEntries: (shopId: string) => api.get<{ data: CashEntryDTO[]; meta: PageMeta }>(path(shopId, "/cash-entries"), { params: { page: 1, limit: 20 } }).then(r => r.data),
  reminders: (shopId: string, partyId: string, body: { channel: "SMS" | "WHATSAPP_LINK"; message?: string }) => api.post<{ data: ReminderDTO }>(path(shopId, `/parties/${partyId}/reminders`), body).then(r => r.data.data),
  report: (shopId: string, params: { from?: string; to?: string }) => api.get<{ data: HisabReportDTO }>(path(shopId, "/report"), { params }).then(r => r.data.data),
  statement: (shopId: string, partyId: string, params?: { from?: string; to?: string }) => api.get<{ data: PartyStatementDTO }>(path(shopId, `/parties/${partyId}/statement`), { params }).then(r => r.data.data),
  expenses: (shopId: string) => api.get<{ data: ExpenseCategoryDTO[] }>(path(shopId, "/expense-categories")).then(r => r.data.data),
};
