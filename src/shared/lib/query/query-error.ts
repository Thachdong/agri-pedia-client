import { publicEnv } from "@/shared/config";
import { APP_ERROR_CODE, AppError, isAppError } from "@/shared/lib/http";
import type { TQueryMeta } from "./query.types";

type TErrorNotifier = (error: AppError) => void;

let notifier: TErrorNotifier | null = null;

/** Đăng ký cách hiển thị lỗi global (vd: toast) — gọi một lần trong AppProviders. */
export function setQueryErrorNotifier(fn: TErrorNotifier | null): void {
  notifier = fn;
}

export function handleGlobalError(error: unknown, meta?: TQueryMeta): void {
  if (meta?.silent) return;
  const appError = isAppError(error)
    ? error
    : new AppError({ status: 0, code: APP_ERROR_CODE.UNKNOWN_ERROR, message: "Đã có lỗi xảy ra, vui lòng thử lại" });
  // Hết phiên: http client đã chuyển hướng về /login.
  if (appError.code === APP_ERROR_CODE.SESSION_EXPIRED) return;
  if (notifier) notifier(appError);
  else if (publicEnv.isDev) console.error(appError);
}
