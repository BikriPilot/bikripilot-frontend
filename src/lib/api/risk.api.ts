import { api } from "./client";
import type { RiskCheckDTO, RiskHistoryItem, CheckRiskInput, RiskHistoryQuery } from "@/types/risk";
import type { PageMeta } from "@/types/product";

const path = (shopId: string, suffix = "") => `/shops/${shopId}${suffix}`;

export const riskApi = {
  check: (shopId: string, body: CheckRiskInput) =>
    api.post<{ data: RiskCheckDTO }>(path(shopId, "/risk/check"), body).then((r) => r.data.data),
  history: (shopId: string, params?: RiskHistoryQuery) =>
    api
      .get<{ data: RiskHistoryItem[]; meta: PageMeta }>(path(shopId, "/risk/history"), { params })
      .then((r) => r.data),
};
