import type { FieldValues, Path } from "react-hook-form";
import { APP_ERROR_CODE, isAppError } from "@/shared/lib/http";
import type { TAppForm } from "./use-app-form";

export const FORM_ROOT_ERROR = "root.server" as const;

function hasPath(values: unknown, path: string): boolean {
  let current: unknown = values;
  for (const key of path.split(".")) {
    if (typeof current !== "object" || current === null || !(key in current)) return false;
    current = (current as Record<string, unknown>)[key];
  }
  return true;
}

/**
 * Gắn lỗi từ API vào form: lỗi validation của NestJS ("<field> must be ...") → lỗi của field,
 * còn lại (domain error) → `errors.root.server`. Trả về false nếu `error` không phải AppError.
 */
export function applyServerErrors<T extends FieldValues>(form: TAppForm<T>, error: unknown): boolean {
  if (!isAppError(error)) return false;

  if (error.code === APP_ERROR_CODE.VALIDATION_ERROR && Array.isArray(error.details)) {
    const values = form.getValues();
    let applied = false;
    for (const message of error.details) {
      const field = message.split(" ")[0];
      if (field && hasPath(values, field)) {
        form.setError(field as Path<T>, { type: "server", message });
        applied = true;
      }
    }
    if (applied) return true;
  }

  form.setError(FORM_ROOT_ERROR, { type: "server", message: error.message });
  return true;
}
