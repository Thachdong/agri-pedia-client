import { useAppInfiniteQuery } from "@/shared/lib/query";
import type { TChatRoomsPage, TChatRoomsView } from "../types/chat.types";
import { chatRoomsQuery } from "./chat.queries";

// totalUnread lấy từ trang đầu (refetch luôn tải lại trang đầu trước) — server tính trên mọi room, không chỉ trang đó.
const toView = ({ pages }: { pages: TChatRoomsPage[] }): TChatRoomsView => ({
  rooms: pages.flatMap((page) => page.rooms),
  totalUnread: pages[0]?.totalUnread ?? 0,
});

export const useChatRooms = () => useAppInfiniteQuery({ ...chatRoomsQuery(), select: toView });
