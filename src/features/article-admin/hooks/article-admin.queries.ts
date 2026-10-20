import type { IHttpClient } from "@/shared/lib/http";
import { appQueryOptions, queryKeys } from "@/shared/lib/query";
import { getAdminArticle, listAdminArticleCrops, listAdminArticleTargets } from "../services/article-admin.service";

/** Danh sách cây + số bài — ô chọn cây ở bảng bài viết và trang chọn bệnh để viết bài. */
export const adminArticleCropsQuery = (client?: IHttpClient) =>
  appQueryOptions({
    queryKey: queryKeys.adminArticles.crops(),
    queryFn: () => listAdminArticleCrops(client),
  });

/** Bệnh + bài của 1 cây — bảng danh sách bài viết. */
export const adminArticleTargetsQuery = (cropSlug: string, client?: IHttpClient) =>
  appQueryOptions({
    queryKey: queryKeys.adminArticles.targets(cropSlug),
    queryFn: () => listAdminArticleTargets(cropSlug, client),
  });

/** Nội dung đang lưu của 1 bài — trang xem trước và form sửa. */
export const adminArticleQuery = (code: string, client?: IHttpClient) =>
  appQueryOptions({
    queryKey: queryKeys.adminArticles.detail(code),
    queryFn: () => getAdminArticle(code, client),
  });
