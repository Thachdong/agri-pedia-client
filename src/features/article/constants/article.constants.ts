import type { TArticleOrigin } from "../types/article.types";

/**
 * Tag cache của Next cho route bài viết — CHUỖI PHẢI KHỚP server (server spec disease-articles-plan.md mục 7),
 * server gọi POST /api/revalidate với các tag này khi bài đổi.
 */
export const ARTICLE_CACHE_TAGS = {
  all: "articles",
  crop: (cropSlug: string) => `articles:${cropSlug}`,
  article: (cropSlug: string, slug: string) => `article:${cropSlug}:${slug}`,
} as const;

/**
 * Tag hợp lệ cho webhook POST /api/revalidate — 3 dạng của ARTICLE_CACHE_TAGS + `article-disease:<CODE>`: server vẫn
 * gửi tag này (client không còn route nào gắn nó) — bỏ khỏi pattern thì cả request webhook bị 400.
 */
export const ARTICLE_CACHE_TAG_PATTERN =
  /^(articles|articles:[a-z0-9-]+|article:[a-z0-9-]+:[a-z0-9-]+|article-disease:[A-Z0-9_]+)$/;

/** Webhook: tối đa 500 tag mỗi lần, mỗi tag ≤ 256 ký tự (giới hạn tag của Next). */
export const ARTICLE_REVALIDATE_MAX_TAGS = 500;
export const ARTICLE_CACHE_TAG_MAX_LENGTH = 256;

/**
 * Lưới an toàn khi webhook bị lỡ (1 giờ) — thay đổi thường đến ngay qua revalidateTag. Webhook lỡ khi client không
 * chạy lúc server gửi (vd. server seed bài lúc deploy trước khi client lên): số liệu / danh sách tự khớp lại sau ≤ 1 giờ.
 * Đổi giá trị thì sửa cả các `export const revalidate` (phải là literal) ở route ISR.
 */
export const ARTICLE_REVALIDATE_SECONDS = 3600;

/** Top articles ở trang chủ — khớp `max-age` server gửi cho GET /knowledge/articles/top. */
export const TOP_ARTICLES_REVALIDATE_SECONDS = 60;

/**
 * `options.next` cho service khi gọi từ route ISR — cache theo tag, hết hạn sau ARTICLE_REVALIDATE_SECONDS.
 * Mỗi request chỉ gắn tag hẹp nhất: server gửi `articles` kèm MỌI lần đổi bài, gắn nó vào bài sẽ xoá cache mọi bài.
 */
export const articleFetchOptions = {
  crops: () => ({ next: { revalidate: ARTICLE_REVALIDATE_SECONDS, tags: [ARTICLE_CACHE_TAGS.all] } }),
  /**
   * Admin chọn lại top articles không chắc kèm webhook → hết hạn theo `Cache-Control: max-age=60` của server;
   * publish / unpublish bài vẫn xoá ngay qua tag `articles`.
   */
  top: () => ({ next: { revalidate: TOP_ARTICLES_REVALIDATE_SECONDS, tags: [ARTICLE_CACHE_TAGS.all] } }),
  sitemap: () => ({ next: { revalidate: ARTICLE_REVALIDATE_SECONDS, tags: [ARTICLE_CACHE_TAGS.all] } }),
  list: (cropSlug: string) => ({
    next: { revalidate: ARTICLE_REVALIDATE_SECONDS, tags: [ARTICLE_CACHE_TAGS.crop(cropSlug)] },
  }),
  detail: (cropSlug: string, slug: string) => ({
    next: {
      revalidate: ARTICLE_REVALIDATE_SECONDS,
      tags: [ARTICLE_CACHE_TAGS.article(cropSlug, slug)],
    },
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

/** Tab lọc ở trang danh sách bài — `all` = không gửi `category`. Nhãn ngắn (khác CATEGORY_LABELS của diagnosis). */
export const ARTICLE_CATEGORY_TABS = [
  { value: "all", label: "Tất cả" },
  { value: "DISEASE", label: "Bệnh" },
  { value: "PEST", label: "Sâu hại" },
  { value: "DISORDER", label: "Rối loạn" },
] as const;

export type TArticleCategoryTab = (typeof ARTICLE_CATEGORY_TABS)[number]["value"];

/** Nhãn kiểm duyệt theo `origin` — bài AI chưa ai sửa vs bài admin viết / đã sửa (trang public + bảng admin). */
export const ARTICLE_ORIGIN_LABELS: Record<TArticleOrigin, string> = {
  AI: "Nội dung được tạo bởi AI",
  ADMIN: "Nội dung được kiểm duyệt bởi Admin",
  AI_REVIEWED: "Nội dung được kiểm duyệt bởi Admin",
};
