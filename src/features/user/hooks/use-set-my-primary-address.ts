import { useAppMutation } from "@/shared/lib/query";
import { setMyPrimaryAddress } from "../services/user.service";
import { primaryAddressKeys } from "./primary-address-keys";

/** Đặt address (theo id) làm primary của người đang đăng nhập. `userId` = id của chính họ. */
export const useSetMyPrimaryAddress = (userId: string) =>
  useAppMutation({
    mutationFn: (addressId: string) => setMyPrimaryAddress(addressId),
    invalidates: () => primaryAddressKeys(userId),
  });
