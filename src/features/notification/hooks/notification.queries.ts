import type { IHttpClient } from "@/shared/lib/http";
import { appInfiniteQueryOptions, queryKeys } from "@/shared/lib/query";
import { getNotifications } from "../services/notification.service";

/** Mới nhất trước, phân trang cursor (`nextCursor` null = hết). */
export const notificationsQuery = (client?: IHttpClient) =>
  appInfiniteQueryOptions({
    queryKey: queryKeys.notifications.list(),
    queryFn: ({ pageParam }) => getNotifications(pageParam, client),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
