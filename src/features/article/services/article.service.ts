import { http, type IHttpClient, type TRequestOptions } from "@/shared/lib/http";
import type {
  TArticleCropsResponse,
  TArticleDetail,
  TArticleListParams,
  TArticleListResponse,
  TArticleSitemap,
  TDiseaseArticleLink,
  TDiseaseArticleSource,
} from "../types/article.types";

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
 * Bài viết của 1 bệnh (field `article` của GET /knowledge/diseases/:code) — cho redirect `/diseases/[code]`.
 * Mã lạ → 404 KNOWLEDGE_DISEASE_NOT_FOUND; null = bệnh chưa có bài.
 */
export const getDiseaseArticleLink = async (
  diseaseCode: string,
  client: IHttpClient = http,
  options?: TRequestOptions,
): Promise<TDiseaseArticleLink | null> => {
  const disease = await client.get<TDiseaseArticleSource>(
    `/knowledge/diseases/${encodeURIComponent(diseaseCode)}`,
    options,
  );
  return disease.article;
};
