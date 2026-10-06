export interface CustomerListItemDTO {
  id: string; name: string | null; phone: string | null; district: string | null; tags: string[];
  isBlocked: boolean; totalOrders: number; deliveredOrders: number; returnedOrders: number;
  totalSpentPaisa: number; lastOrderAt: string | null; createdAt: string;
}
export interface CustomerDTO extends CustomerListItemDTO {
  altPhone: string | null; email: string | null; address: string | null; area: string | null;
  notes: string | null; blockedReason: string | null; cancelledOrders: number;
  identities: Array<{ channelType: string; channelName: string; displayName: string | null; profilePicUrl: string | null }>;
  latestRisk: { level: string; score: number; action: string; checkedAt: string } | null;
  hisab: { partyId: string; balancePaisa: number } | null; conversationIds: string[];
}
export interface CustomerInput {
  name?: string | null; phone?: string | null; altPhone?: string | null; email?: string | null;
  address?: string | null; district?: string | null; area?: string | null; notes?: string | null; tags?: string[];
}
export interface CustomerOrderDTO {
  id: string; orderNumber: string; status: string; source: string; customerName: string; customerPhone: string;
  district: string | null; totalPaisa: number; codAmountPaisa: number; paymentStatus: string;
  itemCount: number; firstItemName: string | null; readinessScore: number; isDuplicateSuspect: boolean;
  riskLevel: string | null; createdAt: string;
}
