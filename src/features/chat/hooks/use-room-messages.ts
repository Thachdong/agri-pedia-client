import { useAppInfiniteQuery } from "@/shared/lib/query";
import type { TChatMessage, TChatMessagesPage } from "../types/chat.types";
import { roomMessagesQuery } from "./chat.queries";

/** API trả mới nhất trước → đảo lại theo thời gian (cũ → mới) để hiển thị từ trên xuống. */
const toChronological = ({ pages }: { pages: TChatMessagesPage[] }): TChatMessage[] =>
  pages.flatMap((page) => page.messages).reverse();

/** `roomId` null = cuộc chat mới (chưa có room) → không gọi API, không có tin. */
export const useRoomMessages = (roomId: string | null) =>
  useAppInfiniteQuery({ ...roomMessagesQuery(roomId ?? ""), select: toChronological, enabled: roomId !== null });
