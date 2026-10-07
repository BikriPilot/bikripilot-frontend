import { api } from "@/lib/api/client";
import type { PageMeta } from "@/types/product";
import type { ShipmentDTO } from "@/types/courier";
import type {
  PayoutCreateInput,
  PayoutDTO,
  PayoutImportInput,
  PayoutListQuery,
  ReconciliationSummaryDTO,
  UnpaidShipmentQuery,
} from "@/types/reconciliation";

const payoutPath = (shopId: string, suffix = "") =>
  `/shops/${shopId}/payouts${suffix}`;
const reconciliationPath = (shopId: string, suffix = "") =>
  `/shops/${shopId}/reconciliation${suffix}`;

export const reconciliationApi = {
  summary: (shopId: string) =>
    api
      .get<{ data: ReconciliationSummaryDTO }>(
        reconciliationPath(shopId, "/summary"),
      )
      .then((r) => r.data.data),
  unpaid: (shopId: string, params: UnpaidShipmentQuery = {}) =>
    api
      .get<{ data: ShipmentDTO[]; meta: PageMeta }>(
        reconciliationPath(shopId, "/unpaid"),
        { params },
      )
      .then((r) => r.data),
  list: (shopId: string, params: PayoutListQuery = {}) =>
    api
      .get<{ data: PayoutDTO[]; meta: PageMeta }>(payoutPath(shopId), {
        params,
      })
      .then((r) => r.data),
  get: (shopId: string, payoutId: string) =>
    api
      .get<{ data: PayoutDTO }>(payoutPath(shopId, `/${payoutId}`))
      .then((r) => r.data.data),
  create: (shopId: string, input: PayoutCreateInput) =>
    api
      .post<{ data: PayoutDTO }>(payoutPath(shopId), input)
      .then((r) => r.data.data),
  importCsv: (shopId: string, input: PayoutImportInput, file: File) => {
    const body = new FormData();
    body.append("file", file);
    body.append("provider", input.provider);
    body.append("payoutDate", input.payoutDate);
    body.append("receivedAmountPaisa", String(input.receivedAmountPaisa));
    body.append("moneyAccountId", input.moneyAccountId);
    if (input.courierConnectionId)
      body.append("courierConnectionId", input.courierConnectionId);
    if (input.reference) body.append("reference", input.reference);
    if (input.note) body.append("note", input.note);
    return api
      .post<{ data: PayoutDTO }>(payoutPath(shopId, "/import"), body)
      .then((r) => r.data.data);
  },
  rematch: (shopId: string, payoutId: string) =>
    api
      .post<{ data: PayoutDTO }>(payoutPath(shopId, `/${payoutId}/rematch`))
      .then((r) => r.data.data),
  confirm: (shopId: string, payoutId: string, acceptMismatch = false) =>
    api
      .post<{ data: PayoutDTO }>(payoutPath(shopId, `/${payoutId}/confirm`), {
        acceptMismatch,
      })
      .then((r) => r.data.data),
  remove: (shopId: string, payoutId: string) =>
    api
      .delete<{ data: null }>(payoutPath(shopId, `/${payoutId}`))
      .then((r) => r.data.data),
};
