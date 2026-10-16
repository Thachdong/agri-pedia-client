import { http, type IHttpClient, type TRequestOptions } from "@/shared/lib/http";
import type { TArticleCropsResponse, TArticleListParams, TArticleListResponse } from "../types/article.types";

/*
 * Public — mọi hàm nhận `options` để page server truyền cache của Next (`articleFetchOptions`).
 * Route ISR dùng `publicServerHttp` (không đọc cookie); "Xem thêm" phía client dùng `http` (BFF).
 */

/** Cây có bài viết, theo thứ tự hiển thị. */
export const listArticleCrops = (client: IHttpClient = http, options?: TRequestOptions) =>
  client.get<TArticleCropsResponse>("/knowledge/articles/crops", options);

/** Tóm tắt bài của 1 cây theo tiêu đề, phân trang cursor; slug cây lạ → 404 KNOWLEDGE_CROP_NOT_FOUND. */
export const listArticles = (params: TArticleListParams, client: IHttpClient = http, options?: TRequestOptions) =>
  client.get<TArticleListResponse>("/knowledge/articles", { ...options, query: params });
