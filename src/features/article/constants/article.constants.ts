/**
 * Tag cache của Next cho route bài viết — CHUỖI PHẢI KHỚP server (server spec disease-articles-plan.md mục 7),
 * server gọi POST /api/revalidate với các tag này khi bài đổi.
 */
export const ARTICLE_CACHE_TAGS = {
  all: "articles",
  crop: (cropSlug: string) => `articles:${cropSlug}`,
  article: (cropSlug: string, slug: string) => `article:${cropSlug}:${slug}`,
  disease: (diseaseCode: string) => `article-disease:${diseaseCode}`,
} as const;

/** Lưới an toàn khi webhook lỗi (30 ngày) — thay đổi thường đến qua revalidateTag. */
export const ARTICLE_REVALIDATE_SECONDS = 2_592_000;

/** `options.next` cho service khi gọi từ route ISR — cache theo tag, hết hạn sau ARTICLE_REVALIDATE_SECONDS. */
export const articleFetchOptions = {
  crops: () => ({ next: { revalidate: ARTICLE_REVALIDATE_SECONDS, tags: [ARTICLE_CACHE_TAGS.all] } }),
  list: (cropSlug: string) => ({
    next: { revalidate: ARTICLE_REVALIDATE_SECONDS, tags: [ARTICLE_CACHE_TAGS.all, ARTICLE_CACHE_TAGS.crop(cropSlug)] },
  }),
} as const;

/** Trang đầu danh sách bài render ở server (SEO); trang sau tải tiếp phía client. */
export const ARTICLE_LIST_PAGE_SIZE = 50;

/** Mã lỗi domain của GET /knowledge/articles* (api.md action 40 ~ 43). */
export const ARTICLE_ERROR_CODE = {
  cropNotFound: "KNOWLEDGE_CROP_NOT_FOUND",
  articleNotFound: "KNOWLEDGE_ARTICLE_NOT_FOUND",
  invalidCursor: "KNOWLEDGE_ARTICLE_INVALID_CURSOR",
} as const;
