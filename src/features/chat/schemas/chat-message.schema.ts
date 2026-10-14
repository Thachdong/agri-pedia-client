import { schema, v } from "@/shared/lib/validation";
import type { TChatMessageFormValues } from "../types/chat.types";

/** Mirror `chat.message.send` (server: message 1..2000 ký tự sau trim → CHAT_INVALID_MESSAGE). */
export const chatMessageSchema = schema<TChatMessageFormValues>({
  message: v.string().trim().min(1).max(2000).required().messages({ "string.empty": "Nhập tin nhắn" }),
});
