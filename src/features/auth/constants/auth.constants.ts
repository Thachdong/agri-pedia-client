import type { TLoginType } from "../types/auth.types";

export const LOGIN_TYPES = ["EMAIL", "PHONE"] as const satisfies readonly TLoginType[];

/** Nhãn tab theo wireframe. */
export const LOGIN_TYPE_LABELS: Record<TLoginType, string> = {
  EMAIL: "EMAIL",
  PHONE: "PHONE",
};
