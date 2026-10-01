import { useAppQuery } from "@/shared/lib/query";
import { categoriesQuery } from "./product.queries";

/** `data` = danh sách category (đã bỏ lớp `items`). */
export const useCategories = () => useAppQuery({ ...categoriesQuery(), select: (data) => data.items });
