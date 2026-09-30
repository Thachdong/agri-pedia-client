import type { IHttpClient } from "@/shared/lib/http";
import { appInfiniteQueryOptions, queryKeys } from "@/shared/lib/query";
import { getChatRooms } from "../services/chat.service";

/** Room có tin mới nhất trước, phân trang cursor (`nextCursor` null = hết). */
export const chatRoomsQuery = (client?: IHttpClient) =>
  appInfiniteQueryOptions({
    queryKey: queryKeys.chat.rooms(),
    queryFn: ({ pageParam }) => getChatRooms(pageParam, client),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
