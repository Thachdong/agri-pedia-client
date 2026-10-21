import { http, type IHttpClient, type TRequestOptions } from "@/shared/lib/http";
import { CROP_INDEX_MAX_PAGES, CROP_INDEX_PAGE_SIZE } from "../constants/article.constants";
import type {
  TArticleCropsResponse,
  TArticleDetail,
  TArticleListItem,
  TArticleListParams,
  TArticleListResponse,
  TArticleSitemap,
  TTopArticlesResponse,
} from "../types/article.types";

/*
 * Public — mọi hàm nhận `options` để page server truyền cache của Next (`articleFetchOptions`).
 * Route ISR dùng `publicServerHttp` (không đọc cookie); "Xem thêm" phía client dùng `http` (BFF).
 */

/** Cây có bài viết, theo thứ tự hiển thị. */
export const listArticleCrops = (client: IHttpClient = http, options?: TRequestOptions) =>
  client.get<TArticleCropsResponse>("/knowledge/articles/crops", options);

/** Top articles của mọi cây (trang chủ), mỗi cây theo thứ tự admin chọn. */
export const getTopArticles = (client: IHttpClient = http, options?: TRequestOptions) =>
  client.get<TTopArticlesResponse>("/knowledge/articles/top", options);

/** Tóm tắt bài của 1 cây theo tiêu đề, phân trang cursor; slug cây lạ → 404 KNOWLEDGE_CROP_NOT_FOUND. */
export const listArticles = (params: TArticleListParams, client: IHttpClient = http, options?: TRequestOptions) =>
  client.get<TArticleListResponse>("/knowledge/articles", { ...options, query: params });

/** Bài viết sẵn để render; cây hoặc bài không có → 404 KNOWLEDGE_CROP_NOT_FOUND / KNOWLEDGE_ARTICLE_NOT_FOUND. */
export const getArticle = (cropSlug: string, slug: string, client: IHttpClient = http, options?: TRequestOptions) =>
  client.get<TArticleDetail>(
    `/knowledge/articles/${encodeURIComponent(cropSlug)}/${encodeURIComponent(slug)}`,
    options,
  );

/** Bài được index (REVIEWED) + ngày cập nhật mới nhất theo cây — cho `app/sitemap.ts`. */
export const getArticleSitemap = (client: IHttpClient = http, options?: TRequestOptions) =>
  client.get<TArticleSitemap>("/knowledge/articles/sitemap", options);

/**
 * Toàn bộ bài (đã publish, gồm DRAFT) của 1 cây — đi hết các trang cursor, tối đa CROP_INDEX_MAX_PAGES. API chưa lọc
 * được theo diseaseCode nên bên gọi tự lọc theo `disease.code`.
 */
export const listAllCropArticles = async (cropSlug: string, client: IHttpClient = http, options?: TRequestOptions) => {
  const articles: TArticleListItem[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < CROP_INDEX_MAX_PAGES; page++) {
    const response = await listArticles({ crop: cropSlug, cursor, limit: CROP_INDEX_PAGE_SIZE }, client, options);
    articles.push(...response.articles);
    if (!response.nextCursor) break;
    cursor = response.nextCursor;
  }
  return articles;
};
