import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { runtimeConfig } from "@/config/runtime";
import { PLAN_ERROR_CODES } from "@/constants/errorCodes";
import { useAuthStore } from "@/stores/authStore";
import { useShopStore } from "@/stores/shopStore";
import { useUiStore } from "@/stores/uiStore";
import type { ApiClientErrorShape, ApiErrorBody } from "@/types/api";
import type { MeDTO } from "@/types/auth";

export class ApiClientError extends Error implements ApiClientErrorShape {
  status: number;
  code: ApiClientErrorShape["code"];
  details?: unknown;
  constructor(shape: ApiClientErrorShape) {
    super(shape.message);
    this.name = "ApiClientError";
    this.status = shape.status;
    this.code = shape.code;
    this.details = shape.details;
  }
}
export const api = axios.create({
  baseURL: runtimeConfig.apiUrl,
  withCredentials: true,
});
let savedAdminSession: {
  accessToken: string | null;
  user: MeDTO | null;
  shopId: string | null;
} | null = null;
let impersonationShopName: string | null = null;

export function enterImpersonation(
  accessToken: string,
  shopId: string,
  shopName: string,
) {
  const current = useAuthStore.getState();
  savedAdminSession = {
    accessToken: current.accessToken,
    user: current.user,
    shopId: useShopStore.getState().currentShopId,
  };
  impersonationShopName = shopName;
  useShopStore.getState().setCurrentShopId(shopId);
  if (current.user) {
    current.setAuth(accessToken, {
      ...current.user,
      memberships: [
        {
          shopId,
          shopName,
          shopSlug: "",
          shopLogoUrl: null,
          shopStatus: "ACTIVE",
          role: "OWNER",
          permissions: [],
        },
      ],
      impersonation: { shopId, readOnly: true },
    });
  } else {
    current.setAccessToken(accessToken);
  }
}

export function exitImpersonation() {
  if (savedAdminSession) {
    const current = useAuthStore.getState();
    if (savedAdminSession.accessToken && savedAdminSession.user) {
      current.setAuth(savedAdminSession.accessToken, savedAdminSession.user);
    } else {
      current.clear();
    }
    useShopStore.getState().setCurrentShopId(savedAdminSession.shopId);
  }
  savedAdminSession = null;
  impersonationShopName = null;
}

export function isImpersonating() {
  return savedAdminSession !== null;
}

export function getImpersonationShopName() {
  return impersonationShopName;
}

let refreshPromise: Promise<string | null> | null = null;
const isAuthPath = (url = "") =>
  url.includes("/auth/refresh") || url.includes("/auth/login");
api.interceptors.request.use((config) => {
  if (
    isImpersonating() &&
    config.method &&
    config.method !== "get" &&
    config.method !== "head"
  ) {
    throw new ApiClientError({
      status: 403,
      code: "IMPERSONATION_READ_ONLY",
      message: "This session is read-only.",
    });
  }
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; error?: ApiErrorBody }>) => {
    const body = error.response?.data?.error;
    const config = error.config as
      (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (
      error.response?.status === 401 &&
      (body?.code === "TOKEN_EXPIRED" || body?.code === "UNAUTHENTICATED") &&
      !isImpersonating() &&
      config &&
      !config._retry &&
      !isAuthPath(config.url)
    ) {
      config._retry = true;
      refreshPromise ??= api
        .post<{
          data: { accessToken: string; user: import("@/types/auth").MeDTO };
        }>("/auth/refresh", undefined, {
          headers: { "X-Requested-With": "bikrio-web" },
        })
        .then((response) => {
          const token = response.data.data.accessToken;
          useAuthStore.getState().setAuth(token, response.data.data.user);
          return token;
        })
        .catch(() => null)
        .finally(() => {
          refreshPromise = null;
        });
      const token = await refreshPromise;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        return api(config);
      }
      useAuthStore.getState().clear();
      if (typeof window !== "undefined")
        window.location.assign(
          `/login?next=${encodeURIComponent(window.location.pathname)}`,
        );
    }
    if (body?.code && PLAN_ERROR_CODES.includes(body.code)) {
      const details =
        body.details && typeof body.details === "object"
          ? (body.details as {
              feature?: unknown;
              limit?: unknown;
              used?: unknown;
            })
          : {};
      useUiStore.getState().openUpgrade({
        feature:
          typeof details.feature === "string" ? details.feature : undefined,
        limit: typeof details.limit === "number" ? details.limit : undefined,
        used: typeof details.used === "number" ? details.used : undefined,
      });
    }
    throw new ApiClientError({
      status: error.response?.status ?? 0,
      code: body?.code ?? "UNKNOWN_ERROR",
      message: error.response?.data?.message ?? body?.message ?? error.message,
      details: body?.details,
    });
  },
);
