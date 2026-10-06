import { api } from "./client";
import type {
  InvitationDTO,
  MemberDTO,
  OnboardingDTO,
  ShopDTO,
  ShopSettingsDTO,
} from "@/types/shop";
import type { MembershipDTO } from "@/types/auth";
const data = <T>(request: Promise<{ data: { data: T } }>) =>
  request.then((response) => response.data.data);
const path = (shopId: string, suffix = "") => `/shops/${shopId}${suffix}`;
export const shopsApi = {
  list: () => data<MembershipDTO[]>(api.get("/shops")),
  get: (shopId: string) => data<ShopDTO>(api.get(path(shopId))),
  update: (shopId: string, body: Record<string, unknown>) =>
    data<ShopDTO>(api.patch(path(shopId), body)),
  settings: (shopId: string) =>
    data<ShopSettingsDTO>(api.get(path(shopId, "/settings"))),
  updateSettings: (shopId: string, body: Record<string, unknown>) =>
    data<ShopSettingsDTO>(api.patch(path(shopId, "/settings"), body)),
  onboarding: (shopId: string) =>
    data<OnboardingDTO>(api.get(path(shopId, "/onboarding"))),
  completeOnboarding: (shopId: string, dismissed = false) =>
    data<OnboardingDTO>(
      api.post(path(shopId, "/onboarding/complete"), { dismissed }),
    ),
  members: (shopId: string) =>
    data<MemberDTO[]>(api.get(path(shopId, "/members"))),
  updateMember: (shopId: string, memberId: string, role: string) =>
    data<MemberDTO>(api.patch(path(shopId, `/members/${memberId}`), { role })),
  removeMember: (shopId: string, memberId: string) =>
    data<null>(api.delete(path(shopId, `/members/${memberId}`))),
  invitations: (shopId: string) =>
    data<InvitationDTO[]>(api.get(path(shopId, "/invitations"))),
  invite: (shopId: string, body: { email: string; role: string }) =>
    data<InvitationDTO>(api.post(path(shopId, "/invitations"), body)),
  revokeInvitation: (shopId: string, id: string) =>
    data<null>(api.delete(path(shopId, `/invitations/${id}`))),
  invitePreview: (token: string) =>
    data<import("@/types/shop").InvitePreviewDTO>(
      api.get(`/invitations/${encodeURIComponent(token)}`),
    ),
  acceptInvite: (token: string) =>
    data<MembershipDTO>(api.post("/invitations/accept", { token })),
};
