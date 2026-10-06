import { api } from "./client";
import type {
  EntitlementsDTO,
  FeatureEntitlementDTO,
  SubscriptionDTO,
} from "@/types/entitlement";
const data = <T>(request: Promise<{ data: { data: T } }>) =>
  request.then((response) => response.data.data);
const path = (id: string, suffix: string) => `/shops/${id}${suffix}`;
export const entitlementsApi = {
  get: (shopId: string) =>
    data<EntitlementsDTO>(api.get(path(shopId, "/entitlements"))),
  subscription: (shopId: string) =>
    data<SubscriptionDTO>(api.get(path(shopId, "/subscription"))),
  usage: (shopId: string) =>
    data<FeatureEntitlementDTO[]>(api.get(path(shopId, "/usage"))),
};
