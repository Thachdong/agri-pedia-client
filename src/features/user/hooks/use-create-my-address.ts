import { queryKeys, useAppMutation } from "@/shared/lib/query";
import { createMyAddress } from "../services/user.service";
import type { TCreateAddressInput } from "../types/user.types";
import { primaryAddressKeys } from "./primary-address-keys";

/** Thêm address cho người đang đăng nhập. `userId` = id của chính họ — address mới là primary thì làm stale cả profile. */
export const useCreateMyAddress = (userId: string) =>
  useAppMutation({
    mutationFn: (input: TCreateAddressInput) => createMyAddress(input),
    invalidates: (input) => (input.isPrimary ? primaryAddressKeys(userId) : [queryKeys.users.addresses()]),
  });
