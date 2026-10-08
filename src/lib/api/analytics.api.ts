import { api } from "@/lib/api/client";
import type {
  AnalyticsOverviewDTO,
  AnalyticsRange,
  AnalyticsInterval,
  DashboardDTO,
  InboxStatsDTO,
  ProfitDTO,
  SalesTrendPointDTO,
  SourceBreakdownDTO,
  StatusBreakdownDTO,
  TeamStatsRowDTO,
  TopProductDTO,
} from "@/types/analytics";

const analyticsPath = (shopId: string, endpoint: string) =>
  `/shops/${shopId}/analytics/${endpoint}`;

export const analyticsApi = {
  dashboard: (shopId: string) =>
    api
      .get<{ data: DashboardDTO }>(`/shops/${shopId}/dashboard`)
      .then((response) => response.data.data),
  overview: (shopId: string, range: AnalyticsRange) =>
    api
      .get<{ data: AnalyticsOverviewDTO }>(analyticsPath(shopId, "overview"), {
        params: range,
      })
      .then((response) => response.data.data),
  salesTrend: (
    shopId: string,
    range: AnalyticsRange,
    interval: AnalyticsInterval = "day",
  ) =>
    api
      .get<{ data: SalesTrendPointDTO[] }>(
        analyticsPath(shopId, "sales-trend"),
        { params: { ...range, interval } },
      )
      .then((response) => response.data.data),
  statusBreakdown: (shopId: string, range: AnalyticsRange) =>
    api
      .get<{ data: StatusBreakdownDTO[] }>(
        analyticsPath(shopId, "status-breakdown"),
        { params: range },
      )
      .then((response) => response.data.data),
  topProducts: (shopId: string, range: AnalyticsRange, limit = 10) =>
    api
      .get<{ data: TopProductDTO[] }>(analyticsPath(shopId, "top-products"), {
        params: { ...range, limit },
      })
      .then((response) => response.data.data),
  sources: (shopId: string, range: AnalyticsRange) =>
    api
      .get<{ data: SourceBreakdownDTO[] }>(analyticsPath(shopId, "sources"), {
        params: range,
      })
      .then((response) => response.data.data),
  inbox: (shopId: string, range: AnalyticsRange) =>
    api
      .get<{ data: InboxStatsDTO }>(analyticsPath(shopId, "inbox"), {
        params: range,
      })
      .then((response) => response.data.data),
  profit: (shopId: string, range: AnalyticsRange) =>
    api
      .get<{ data: ProfitDTO }>(analyticsPath(shopId, "profit"), {
        params: range,
      })
      .then((response) => response.data.data),
  team: (shopId: string, range: AnalyticsRange) =>
    api
      .get<{ data: TeamStatsRowDTO[] }>(analyticsPath(shopId, "team"), {
        params: range,
      })
      .then((response) => response.data.data),
};
