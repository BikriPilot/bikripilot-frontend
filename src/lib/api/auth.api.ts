import { api } from "./client";
import type {
  AuthResultDTO,
  LoginResultDTO,
  MeDTO,
  SessionDTO,
  TwoFactorSetupDTO,
} from "@/types/auth";
const data = <T>(request: Promise<{ data: { data: T } }>) =>
  request.then((response) => response.data.data);
export const authApi = {
  register: (body: Record<string, unknown>) =>
    data<AuthResultDTO>(api.post("/auth/register", body)),
  login: (body: Record<string, unknown>) =>
    data<LoginResultDTO>(api.post("/auth/login", body)),
  verifyTwoFactor: (body: { twoFactorToken: string; code: string }) =>
    data<AuthResultDTO>(api.post("/auth/2fa/verify", body)),
  refresh: () =>
    data<AuthResultDTO>(
      api.post("/auth/refresh", undefined, {
        headers: { "X-Requested-With": "bikrio-web" },
      }),
    ),
  logout: () =>
    data<null>(
      api.post("/auth/logout", undefined, {
        headers: { "X-Requested-With": "bikrio-web" },
      }),
    ),
  logoutAll: () => data<null>(api.post("/auth/logout-all")),
  me: () => data<MeDTO>(api.get("/auth/me")),
  updateMe: (body: Record<string, unknown>) =>
    data<MeDTO>(api.patch("/auth/me", body)),
  sessions: () => data<SessionDTO[]>(api.get("/auth/sessions")),
  forgotPassword: (body: Record<string, unknown>) =>
    data<null>(api.post("/auth/forgot-password", body)),
  resetPassword: (body: Record<string, unknown>) =>
    data<null>(api.post("/auth/reset-password", body)),
  verifyEmail: (token: string) =>
    data<null>(api.post("/auth/verify-email", { token })),
  resendVerification: () => data<null>(api.post("/auth/resend-verification")),
  changePassword: (body: Record<string, unknown>) =>
    data<null>(api.post("/auth/change-password", body)),
  setupTwoFactor: () => data<TwoFactorSetupDTO>(api.post("/auth/2fa/setup")),
  enableTwoFactor: (code: string) =>
    data<MeDTO>(api.post("/auth/2fa/enable", { code })),
  disableTwoFactor: (body: { password: string; code: string }) =>
    data<MeDTO>(api.post("/auth/2fa/disable", body)),
};
