import type { IHttpClient } from "@/shared/lib/http";
import { appInfiniteQueryOptions, queryKeys } from "@/shared/lib/query";
import { getChatRooms, getRoomMessages } from "../services/chat.service";

/** Room có tin mới nhất trước, phân trang cursor (`nextCursor` null = hết). */
export const chatRoomsQuery = (client?: IHttpClient) =>
  appInfiniteQueryOptions({
    queryKey: queryKeys.chat.rooms(),
    queryFn: ({ pageParam }) => getChatRooms(pageParam, client),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

/** Tin nhắn một room — trang kế là tin CŨ hơn (cuộn lên). */
export const roomMessagesQuery = (roomId: string, client?: IHttpClient) =>
  appInfiniteQueryOptions({
    queryKey: queryKeys.chat.messages(roomId),
    queryFn: ({ pageParam }) => getRoomMessages(roomId, pageParam, client),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
