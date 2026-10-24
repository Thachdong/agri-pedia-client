import { reverseGeocode } from "@/shared/lib/geocode";
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

/** ~1m — các lần chọn gần trùng dùng chung cache, đỡ gọi provider (giới hạn 1 req/s). */
const roundCoord = (value: number) => Math.round(value * 1e5) / 1e5;

export const reverseGeocodeQuery = (lat: number, long: number) => {
  const [roundedLat, roundedLong] = [roundCoord(lat), roundCoord(long)];
  return appQueryOptions({
    queryKey: queryKeys.location.reverse(roundedLat, roundedLong),
    queryFn: ({ signal }) => reverseGeocode(roundedLat, roundedLong, signal),
    staleTime: Infinity,
    // Chỉ là gợi ý điền form — lỗi thì bỏ qua, không retry dồn request lên provider.
    retry: false,
  });
};
