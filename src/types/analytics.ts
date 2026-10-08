import type { FeatureEntitlementDTO } from "@/types/entitlement";
import type { OrderListItemDTO, OrderSource, OrderStatus } from "@/types/order";

export type AnalyticsInterval = "day" | "week" | "month";
export interface AnalyticsRange {
  from: string;
  to: string;
}

export interface AnalyticsOverviewDTO {
  from: string;
  to: string;
  ordersCount: number;
  confirmedCount: number;
  deliveredCount: number;
  returnedCount: number;
  cancelledCount: number;
  deliveredRevenuePaisa: number;
  bookedRevenuePaisa: number;
  averageOrderValuePaisa: number;
  deliverySuccessRate: number | null;
  returnRate: number | null;
  newCustomers: number;
  aiReplies: number;
  avgFirstResponseSeconds: number | null;
  previous: { ordersCount: number; deliveredRevenuePaisa: number } | null;
}

export interface SalesTrendPointDTO {
  date: string;
  ordersCount: number;
  deliveredCount: number;
  bookedRevenuePaisa: number;
  deliveredRevenuePaisa: number;
}

export interface StatusBreakdownDTO {
  status: OrderStatus;
  count: number;
}

export interface TopProductDTO {
  productId: string | null;
  name: string;
  quantity: number;
  revenuePaisa: number;
}

export interface SourceBreakdownDTO {
  source: OrderSource;
  count: number;
  revenuePaisa: number;
}

export interface InboxStatsDTO {
  conversations: number;
  messagesIn: number;
  messagesOut: number;
  aiMessages: number;
  avgFirstResponseSeconds: number | null;
  unansweredNow: number;
  draftAcceptanceRate: number | null;
}

export interface ProfitDTO {
  revenuePaisa: number;
  productCostPaisa: number;
  courierChargesPaisa: number;
  codChargesPaisa: number;
  expensesPaisa: number;
  estimatedProfitPaisa: number;
  itemsMissingCost: number;
}

export interface TeamStatsRowDTO {
  userId: string;
  name: string;
  repliesSent: number;
  conversationsResolved: number;
  ordersCreated: number;
  ordersDelivered: number;
  ordersReturned: number;
}

export interface DashboardDTO {
  today: {
    ordersCount: number;
    bookedRevenuePaisa: number;
    pendingConfirmations: number;
    toShip: number;
  };
  inbox: { unreadConversations: number; needsHuman: number };
  lowStockCount: number;
  courierHoldingPaisa: number;
  onboarding: {
    completed: boolean;
    dismissed: boolean;
    steps: { key: string; done: boolean }[];
  };
  usage: FeatureEntitlementDTO[];
  recentOrders: OrderListItemDTO[];
}
