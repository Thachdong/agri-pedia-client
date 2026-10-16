import { useAppQuery } from "@/shared/lib/query";
import { diseaseQuery } from "./knowledge.queries";

/** Lỗi hiển thị tại chỗ (card bài viết liên quan / trang bệnh) → không bật thông báo global. */
export const useDisease = (code: string) => useAppQuery({ ...diseaseQuery(code), meta: { silent: true } });
