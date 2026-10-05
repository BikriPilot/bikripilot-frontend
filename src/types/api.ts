import type { ErrorCode } from "@/constants/errorCodes";
export interface ApiErrorBody {
  code: ErrorCode;
  message?: string;
  details?: unknown;
}
export interface ApiClientErrorShape {
  status: number;
  code: ErrorCode | "UNKNOWN_ERROR";
  message: string;
  details?: unknown;
}
export interface ApiEnvelope<T> {
  success: true;
  message: string;
  data: T;
  meta?: unknown;
}
