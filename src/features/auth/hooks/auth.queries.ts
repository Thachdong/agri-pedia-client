import type { IHttpClient } from "@/shared/lib/http";
import { appQueryOptions, queryKeys } from "@/shared/lib/query";
import { getSession } from "../services/auth.service";

/** Phiên chỉ đổi khi login / logout (cả hai đều reset cache) → không refetch trong trang. */
export const sessionQuery = (client?: IHttpClient) =>
  appQueryOptions({
    queryKey: queryKeys.auth.session(),
    queryFn: () => getSession(client),
    staleTime: Infinity,
  });
