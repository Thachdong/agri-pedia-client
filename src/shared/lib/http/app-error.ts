import type { TApiSchema } from "./api-types";

type TDomainErrorBody = TApiSchema<"DomainErrorResponse">;
type TValidationErrorBody = TApiSchema<"ValidationErrorResponse">;

export const APP_ERROR_CODE = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  SESSION_EXPIRED: "SESSION_EXPIRED",
  NETWORK_ERROR: "NETWORK_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type TAppErrorInit = {
  status: number;
  code: string;
  message: string;
  /** Domain error: object chi tiết; validation error: danh sách message của class-validator. */
  details?: Record<string, unknown> | string[];
};

/** Lỗi thống nhất cho mọi request — `status` 0 nghĩa là không nhận được response. */
export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Record<string, unknown> | string[];

  constructor({ status, code, message, details }: TAppErrorInit) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

function isDomainErrorBody(body: unknown): body is TDomainErrorBody {
  return typeof body === "object" && body !== null && typeof (body as TDomainErrorBody).code === "string";
}

function isValidationErrorBody(body: unknown): body is TValidationErrorBody {
  return typeof body === "object" && body !== null && Array.isArray((body as TValidationErrorBody).message);
}

/** Chuẩn hóa body lỗi của NestJS (DomainErrorResponse | ValidationErrorResponse) thành AppError. */
export function toAppError(status: number, body: unknown): AppError {
  if (isDomainErrorBody(body)) {
    return new AppError({ status, code: body.code, message: body.message, details: body.details });
  }
  if (isValidationErrorBody(body)) {
    return new AppError({
      status,
      code: APP_ERROR_CODE.VALIDATION_ERROR,
      message: body.message[0] ?? "Dữ liệu không hợp lệ",
      details: body.message,
    });
  }
  return new AppError({ status, code: APP_ERROR_CODE.UNKNOWN_ERROR, message: "Đã có lỗi xảy ra, vui lòng thử lại" });
}
