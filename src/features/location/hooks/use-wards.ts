import { useAppQuery } from "@/shared/lib/query";
import { wardsQuery } from "./location.queries";

/** Chưa chọn province → không gọi API. */
export const useWards = (provinceCode?: string) =>
  useAppQuery({
    ...wardsQuery(provinceCode ?? ""),
    enabled: Boolean(provinceCode),
    select: (data) => data.wards,
  });
