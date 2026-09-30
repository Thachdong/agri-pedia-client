import { http, type IHttpClient } from "@/shared/lib/http";
import type { TChatRoomsPage } from "../types/chat.types";

export const CHAT_ROOMS_PAGE_SIZE = 20;

export const getChatRooms = (cursor: string | undefined, client: IHttpClient = http) =>
  client.get<TChatRoomsPage>("/chat/rooms", { query: { cursor, limit: CHAT_ROOMS_PAGE_SIZE } });
