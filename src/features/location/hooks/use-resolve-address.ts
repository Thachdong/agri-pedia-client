import { useCallback } from "react";
import type { TCoordinates } from "@/shared/hooks";
import { useAppQueryClient } from "@/shared/lib/query";
import type { TProvince, TWard } from "../types/location.types";
import { matchPlace } from "../utils/match-place";
import { provincesQuery, reverseGeocodeQuery, wardsQuery } from "./location.queries";

/** Địa chỉ suy ra từ toạ độ — phần nào không xác định được thì `undefined` / rỗng. */
export type TResolvedAddress = { province?: TProvince; ward?: TWard; street: string };

/**
 * Trả hàm toạ độ → tỉnh/xã (theo master data) + số nhà/đường. Chỉ gọi khi user chọn vị trí,
 * không tự chạy. Lỗi mạng / provider → reject, bên dùng tự bỏ qua.
 */
export function useResolveAddress() {
  const queryClient = useAppQueryClient();

  return useCallback(
    async ({ lat, long }: TCoordinates): Promise<TResolvedAddress> => {
      const [{ places, street }, { provinces }] = await Promise.all([
        queryClient.fetchQuery(reverseGeocodeQuery(lat, long)),
        queryClient.fetchQuery(provincesQuery()),
      ]);
      const province = matchPlace(provinces, places);
      if (!province) return { street };

      const { wards } = await queryClient.fetchQuery(wardsQuery(province.codename));
      return { province, ward: matchPlace(wards, places), street };
    },
    [queryClient],
  );
}
