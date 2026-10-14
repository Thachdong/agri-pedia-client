import type { IHttpClient } from "@/shared/lib/http";
import { appQueryOptions, queryKeys } from "@/shared/lib/query";
import { getProvinces, getWards } from "../services/location.service";

/** Master data, không đổi trong phiên → không refetch. */
export const provincesQuery = (client?: IHttpClient) =>
  appQueryOptions({
    queryKey: queryKeys.location.provinces(),
    queryFn: () => getProvinces(client),
    staleTime: Infinity,
  });

export const wardsQuery = (provinceCode: string, client?: IHttpClient) =>
  appQueryOptions({
    queryKey: queryKeys.location.wards(provinceCode),
    queryFn: () => getWards(provinceCode, client),
    staleTime: Infinity,
  });
