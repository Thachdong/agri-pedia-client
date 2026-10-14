import { useQueryClient } from "@tanstack/react-query";

/**
 * QueryClient cho chỗ phải tự cập nhật cache NGOÀI mutation — vd. sự kiện realtime (socket).
 * Mutation không cần hook này: dùng `context.client` trong onMutate/onSuccess/onError.
 */
export const useAppQueryClient = () => useQueryClient();
