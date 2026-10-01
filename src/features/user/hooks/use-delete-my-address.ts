import { queryKeys, useAppMutation } from "@/shared/lib/query";
import { deleteMyAddress } from "../services/user.service";

/** Xoá address (theo id) của người đang đăng nhập — chỉ address thường nên primary / profile không đổi. */
export const useDeleteMyAddress = () =>
  useAppMutation({
    mutationFn: (addressId: string) => deleteMyAddress(addressId),
    invalidates: () => [queryKeys.users.addresses()],
  });
