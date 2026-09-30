import type { TChatMessage, TChatMessagesCache } from "../types/chat.types";

/** Thêm tin mới nhất vào đầu trang 0 (cache mới nhất trước); bỏ qua nếu đã có (trùng id). */
export const prependMessage = (cache: TChatMessagesCache | undefined, message: TChatMessage) => {
  if (!cache) return cache;
  if (cache.pages.some((page) => page.messages.some((item) => item.id === message.id))) return cache;
  const [first, ...rest] = cache.pages;
  if (!first) return cache;
  return { ...cache, pages: [{ ...first, messages: [message, ...first.messages] }, ...rest] };
};
