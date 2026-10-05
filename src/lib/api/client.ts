import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { runtimeConfig } from "@/config/runtime";
import { PLAN_ERROR_CODES } from "@/constants/errorCodes";
import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";
import type { ApiClientErrorShape, ApiErrorBody } from "@/types/api";

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
let refreshPromise: Promise<string | null> | null = null;
const isAuthPath = (url = "") =>
  url.includes("/auth/refresh") || url.includes("/auth/login");
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ error?: ApiErrorBody }>) => {
    const body = error.response?.data?.error;
    const config = error.config as
      (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (
      error.response?.status === 401 &&
      (body?.code === "TOKEN_EXPIRED" || body?.code === "UNAUTHENTICATED") &&
      config &&
      !config._retry &&
      !isAuthPath(config.url)
    ) {
      config._retry = true;
      refreshPromise ??= api
        .post<{ data: { accessToken: string } }>("/auth/refresh")
        .then((response) => {
          const token = response.data.data.accessToken;
          useAuthStore.getState().setAccessToken(token);
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
    if (body?.code && PLAN_ERROR_CODES.includes(body.code))
      useUiStore
        .getState()
        .openUpgrade({ feature: String(body.details ?? "") });
    throw new ApiClientError({
      status: error.response?.status ?? 0,
      code: body?.code ?? "UNKNOWN_ERROR",
      message: body?.message ?? error.message,
      details: body?.details,
    });
  },
);
