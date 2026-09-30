import type { AppError } from "@/shared/lib/http";

export type TQueryMeta = {
  /** true → không hiện thông báo lỗi global (component tự xử lý). */
  silent?: boolean;
};

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: AppError;
    queryMeta: TQueryMeta;
    mutationMeta: TQueryMeta;
  }
}
