export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';

export type RiskRecommendation =
  | 'ACCEPT_COD'
  | 'COLLECT_ADVANCE'
  | 'CALL_TO_VERIFY'
  | 'MANUAL_REVIEW';

export interface RiskCheckSummary {
  totalOrders: number;
  receivedOrders: number;
  cancelledOrReturnedOrders: number;
  successRate: number; // 0..1
}

export interface RiskCheckNetwork {
  shops: number;
  total: number;
  delivered: number;
  returned: number;
  cancelled: number;
}

export interface RiskCheckExternal {
  courier: 'STEADFAST' | 'FRAUDBD' | 'NONE';
  total: number;
  delivered: number;
  cancelled: number;
}

export interface RiskCheckInternal {
  total: number;
  delivered: number;
  returned: number;
  cancelled: number;
  isBlocked: boolean;
  fraudReportsCount: number;
}

export interface RiskCheckDTO {
  id: string;
  phone: string;
  score: number;
  level: RiskLevel;
  recommendation: RiskRecommendation;
  reasons: string[];
  summary: RiskCheckSummary;
  network: RiskCheckNetwork;
  external: RiskCheckExternal;
  internal: RiskCheckInternal;
  cached: boolean;
  checkedAt: string;
}

export interface RiskHistoryItem {
  id: string;
  phone: string;
  riskScore: number;
  riskLevel: RiskLevel;
  reasons: string[];
  cached: boolean;
  orderId: string | null;
  createdAt: string;
}

export interface CheckRiskInput {
  phone: string;
  orderId?: string;
  forceRefresh?: boolean;
}

export interface RiskHistoryQuery {
  phone?: string;
  level?: RiskLevel;
  page?: number;
  limit?: number;
}
