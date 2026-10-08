import { api } from "./client";
import type {
  CashEntryDTO,
  ExpenseCategoryDTO,
  HisabReportDTO,
  HisabSummaryDTO,
  LedgerEntryDTO,
  MoneyAccountDTO,
  PartyDTO,
  PartyStatementDTO,
  ReminderDTO,
} from "@/types/hisab";
import type { PageMeta } from "@/types/product";
const path = (shopId: string, suffix: string) =>
  `/shops/${shopId}/hisab${suffix}`;
export const hisabApi = {
  summary: (shopId: string) =>
    api
      .get<{ data: HisabSummaryDTO }>(path(shopId, "/summary"))
      .then((r) => r.data.data),
  parties: (
    shopId: string,
    params: Record<string, string | number | boolean | undefined>,
  ) =>
    api
      .get<{ data: PartyDTO[]; meta: PageMeta }>(path(shopId, "/parties"), {
        params,
      })
      .then((r) => r.data),
  createParty: (
    shopId: string,
    body: Partial<PartyDTO> & { kind: string; name: string },
  ) =>
    api
      .post<{ data: PartyDTO }>(path(shopId, "/parties"), body)
      .then((r) => r.data.data),
  party: (shopId: string, partyId: string) =>
    api
      .get<{ data: PartyDTO }>(path(shopId, `/parties/${partyId}`))
      .then((r) => r.data.data),
  updateParty: (
    shopId: string,
    partyId: string,
    body: Record<string, unknown>,
  ) =>
    api
      .patch<{ data: PartyDTO }>(path(shopId, `/parties/${partyId}`), body)
      .then((r) => r.data.data),
  archiveParty: (shopId: string, partyId: string, archived: boolean) =>
    api.post(path(shopId, `/parties/${partyId}/archive`), { archived }),
  fromCustomer: (shopId: string, customerId: string) =>
    api
      .post<{ data: PartyDTO }>(path(shopId, "/parties/from-customer"), {
        customerId,
      })
      .then((r) => r.data.data),
  entries: (
    shopId: string,
    partyId: string,
    params: Record<string, string | number | undefined> = {},
  ) =>
    api
      .get<{ data: LedgerEntryDTO[]; meta: PageMeta }>(
        path(shopId, `/parties/${partyId}/entries`),
        { params: { page: 1, limit: 20, ...params } },
      )
      .then((r) => r.data),
  updateEntry: (
    shopId: string,
    entryId: string,
    body: Record<string, unknown>,
  ) =>
    api
      .patch<{ data: LedgerEntryDTO }>(
        path(shopId, `/entries/${entryId}`),
        body,
      )
      .then((r) => r.data.data),
  deleteEntry: (shopId: string, entryId: string) =>
    api.delete(path(shopId, `/entries/${entryId}`)),
  createEntry: (
    shopId: string,
    partyId: string,
    body: Record<string, unknown>,
  ) =>
    api
      .post<{ data: LedgerEntryDTO }>(
        path(shopId, `/parties/${partyId}/entries`),
        body,
      )
      .then((r) => r.data.data),
  accounts: (shopId: string) =>
    api
      .get<{ data: MoneyAccountDTO[] }>(path(shopId, "/accounts"), {
        params: { archived: false },
      })
      .then((r) => r.data.data),
  createAccount: (shopId: string, body: Record<string, unknown>) =>
    api.post(path(shopId, "/accounts"), body),
  updateAccount: (
    shopId: string,
    accountId: string,
    body: Record<string, unknown>,
  ) => api.patch(path(shopId, `/accounts/${accountId}`), body),
  cashEntries: (
    shopId: string,
    params: Record<string, string | number | undefined> = {},
  ) =>
    api
      .get<{ data: CashEntryDTO[]; meta: PageMeta }>(
        path(shopId, "/cash-entries"),
        { params: { page: 1, limit: 20, ...params } },
      )
      .then((r) => r.data),
  createCash: (shopId: string, body: Record<string, unknown>) =>
    api.post(path(shopId, "/cash-entries"), body),
  updateCash: (
    shopId: string,
    entryId: string,
    body: Record<string, unknown>,
  ) => api.patch(path(shopId, `/cash-entries/${entryId}`), body),
  deleteCash: (shopId: string, entryId: string) =>
    api.delete(path(shopId, `/cash-entries/${entryId}`)),
  transfer: (shopId: string, body: Record<string, unknown>) =>
    api.post(path(shopId, "/transfers"), body),
  reminderHistory: (shopId: string, partyId: string) =>
    api
      .get<{ data: ReminderDTO[]; meta: PageMeta }>(
        path(shopId, "/reminders"),
        { params: { partyId, page: 1, limit: 20 } },
      )
      .then((r) => r.data),
  reminders: (
    shopId: string,
    partyId: string,
    body: { channel: "SMS" | "WHATSAPP_LINK"; message?: string },
  ) =>
    api
      .post<{ data: ReminderDTO }>(
        path(shopId, `/parties/${partyId}/reminders`),
        body,
      )
      .then((r) => r.data.data),
  report: (shopId: string, params: { from?: string; to?: string }) =>
    api
      .get<{ data: HisabReportDTO }>(path(shopId, "/report"), { params })
      .then((r) => r.data.data),
  statement: (
    shopId: string,
    partyId: string,
    params?: { from?: string; to?: string },
  ) =>
    api
      .get<{ data: PartyStatementDTO }>(
        path(shopId, `/parties/${partyId}/statement`),
        { params },
      )
      .then((r) => r.data.data),
  expenses: (shopId: string) =>
    api
      .get<{ data: ExpenseCategoryDTO[] }>(path(shopId, "/expense-categories"))
      .then((r) => r.data.data),
  createExpense: (shopId: string, body: Record<string, unknown>) =>
    api.post(path(shopId, "/expense-categories"), body),
  updateExpense: (
    shopId: string,
    categoryId: string,
    body: Record<string, unknown>,
  ) => api.patch(path(shopId, `/expense-categories/${categoryId}`), body),
};
