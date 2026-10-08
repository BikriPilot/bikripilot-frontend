import { api } from "@/lib/api/client";
import type { PublicPlan } from "@/types/plan";
import type {
  BillingInvoicePage,
  BillingPreviewDTO,
  BillingProvidersDTO,
  BillingSelection,
  CheckoutResultDTO,
  CouponCheckDTO,
  InvoiceDTO,
  ManualPaymentInput,
  PaymentDTO,
  SubscriptionDTO,
} from "@/types/billing";

const billingPath = (shopId: string) => `/shops/${shopId}/billing`;
const data = <T>(request: Promise<{ data: { data: T } }>) =>
  request.then((response) => response.data.data);

export const billingApi = {
  plans: () => data<PublicPlan[]>(api.get("/public/plans")),
  providers: () =>
    data<BillingProvidersDTO>(api.get("/public/billing-providers")),
  preview: (shopId: string, input: BillingSelection) =>
    data<BillingPreviewDTO>(api.post(`${billingPath(shopId)}/preview`, input)),
  checkCoupon: (
    shopId: string,
    input: {
      code: string;
      planKey: string;
      billingCycle: BillingSelection["billingCycle"];
    },
  ) =>
    data<CouponCheckDTO>(
      api.post(`${billingPath(shopId)}/coupon/check`, input),
    ),
  checkout: (
    shopId: string,
    input: BillingSelection & {
      provider: BillingProvidersDTO["providers"][number]["provider"];
    },
  ) =>
    data<CheckoutResultDTO>(api.post(`${billingPath(shopId)}/checkout`, input)),
  scheduleDowngrade: (shopId: string, input: BillingSelection) =>
    data<SubscriptionDTO>(
      api.post(`${billingPath(shopId)}/schedule-downgrade`, input),
    ),
  cancelDowngrade: (shopId: string) =>
    data<SubscriptionDTO>(
      api.post(`${billingPath(shopId)}/cancel-downgrade`, {}),
    ),
  setAutoRenew: (shopId: string, autoRenew: boolean) =>
    data<SubscriptionDTO>(
      api.post(`${billingPath(shopId)}/auto-renew`, { autoRenew }),
    ),
  setCancelAtPeriodEnd: (shopId: string, cancel: boolean) =>
    data<SubscriptionDTO>(
      api.post(`${billingPath(shopId)}/cancel`, { cancel }),
    ),
  recheckPayment: (shopId: string, paymentId: string) =>
    data<PaymentDTO>(
      api.post(`${billingPath(shopId)}/payments/${paymentId}/recheck`, {}),
    ),
  submitManualPayment: (
    shopId: string,
    paymentId: string,
    input: ManualPaymentInput,
  ) =>
    data<PaymentDTO>(
      api.post(`${billingPath(shopId)}/payments/${paymentId}/manual`, input),
    ),
  invoices: async (shopId: string, page = 1, limit = 50) => {
    const response = await api.get<{
      data: BillingInvoicePage["items"];
      meta: BillingInvoicePage["meta"];
    }>(`${billingPath(shopId)}/invoices`, { params: { page, limit } });
    return { items: response.data.data, meta: response.data.meta };
  },
  invoice: (shopId: string, invoiceId: string) =>
    data<InvoiceDTO>(api.get(`${billingPath(shopId)}/invoices/${invoiceId}`)),
};
