import type { IHttpClient } from "@/shared/lib/http";
import { appQueryOptions, queryKeys } from "@/shared/lib/query";
import { listAdminArticleCrops } from "../services/article-admin.service";

/** Danh sách cây + số bài — ô chọn cây ở bảng bài viết và trang chọn bệnh để viết bài. */
export const adminArticleCropsQuery = (client?: IHttpClient) =>
  appQueryOptions({
    queryKey: queryKeys.adminArticles.crops(),
    queryFn: () => listAdminArticleCrops(client),
  });
