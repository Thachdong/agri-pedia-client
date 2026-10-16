import { useAppQuery } from "@/shared/lib/query";
import { sessionQuery } from "./auth.queries";

/** Đã đăng nhập chưa, đọc ở client — cho trang public ISR (server không đọc cookie). */
export const useSession = () => useAppQuery(sessionQuery());
