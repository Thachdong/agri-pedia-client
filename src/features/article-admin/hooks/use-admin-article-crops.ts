import { useAppQuery } from "@/shared/lib/query";
import { adminArticleCropsQuery } from "./article-admin.queries";

/** Lỗi hiện tại chỗ (bảng / trang chọn bệnh) → không toast. */
export const useAdminArticleCrops = () => useAppQuery({ ...adminArticleCropsQuery(), meta: { silent: true } });
