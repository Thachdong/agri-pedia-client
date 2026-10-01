import { useProvinces } from "./use-provinces";
import { useWards } from "./use-wards";

/** Địa chỉ như API trả (`province` / `ward` là codename). */
export type TAddressCodes = { province: string; ward: string; houseNumber: string };

/**
 * "Số nhà, Phường/Xã, Tỉnh/Thành" — tra tên từ provinces/wards (master data, cache vô hạn).
 * Chưa tải xong / không tìm thấy → dùng tạm codename. `null` → `null`.
 */
export function useAddressLabel(address: TAddressCodes | null | undefined): string | null {
  const { data: provinces } = useProvinces();
  const { data: wards } = useWards(address?.province);
  if (!address) return null;

  const provinceName = provinces?.find((item) => item.codename === address.province)?.name ?? address.province;
  const wardName = wards?.find((item) => item.codename === address.ward)?.name ?? address.ward;
  return [address.houseNumber.trim(), wardName, provinceName].filter(Boolean).join(", ");
}
