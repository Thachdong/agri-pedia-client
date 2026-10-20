import { useAppInfiniteQuery } from "@/shared/lib/query";
import type { TArticleListFilters, TArticleListResponse } from "../types/article.types";
import { articleListQuery } from "./article.queries";

/**
 * Danh sách bài phía client (qua BFF) — `initialPage` là trang đầu đã render ở server (SEO), chỉ khớp
 * filter mặc định (không lọc category); tab khác tải trang đầu ở client.
 */
export function useArticleList(filters: TArticleListFilters, initialPage?: TArticleListResponse) {
  return useAppInfiniteQuery({
    ...articleListQuery(filters),
    initialData: initialPage ? { pages: [initialPage], pageParams: [undefined] } : undefined,
  });
}
