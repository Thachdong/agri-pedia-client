import type { IHttpClient } from "@/shared/lib/http";
import { appQueryOptions, queryKeys } from "@/shared/lib/query";
import { getMe } from "../services/user.service";

/** Hồ sơ người đang đăng nhập — chỉ gọi khi có phiên (guest → 401 → http client đẩy về /login). */
export const meQuery = (client?: IHttpClient) =>
  appQueryOptions({
    queryKey: queryKeys.users.me(),
    queryFn: () => getMe(client),
    staleTime: 5 * 60_000,
  });
