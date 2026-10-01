import { queryKeys } from "@/shared/lib/query";

/**
 * Query stale khi primary address của `userId` đổi: list address, /users/me (`address` = primary),
 * profile public distributor, và danh sách nhà phân phối gần (server lấy tâm từ primary khi đã đăng nhập).
 */
export const primaryAddressKeys = (userId: string) => [
  queryKeys.users.addresses(),
  queryKeys.users.me(),
  queryKeys.distributors.detail(userId),
  queryKeys.distributors.nearbyLists(),
];
