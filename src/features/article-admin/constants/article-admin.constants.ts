/** Luật nội dung bài viết — khớp `article-content-rules.ts` của server (lỗi trả về KNOWLEDGE_ARTICLE_INVALID_CONTENT). */
export const ARTICLE_SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const ARTICLE_SLUG_MAX = 100;
export const ARTICLE_TITLE_MAX = 70;
export const ARTICLE_SUMMARY_MIN = 50;
export const ARTICLE_SUMMARY_MAX = 160;
export const ARTICLE_MARKDOWN_MAX = 100_000;
/** Tên file ảnh dùng trong markdown (`![alt](<file>)`) và `cover` — server luôn lưu webp. */
export const ARTICLE_IMAGE_FILE_PATTERN = /^[a-z0-9-]+\.webp$/;
export const ARTICLE_IMAGE_FILE_MAX = 100;
export const ARTICLE_IMAGE_ALT_MAX = 300;
export const ARTICLE_IMAGE_CAPTION_MAX = 500;
export const ARTICLE_CREDIT_SOURCE_MAX = 200;
export const ARTICLE_CREDIT_AUTHOR_MAX = 200;
export const ARTICLE_CREDIT_LICENSE_MAX = 100;
export const ARTICLE_SOURCE_TITLE_MAX = 300;
/** Ảnh mới: jpg / png / webp (server chuyển sang webp, rộng tối đa 1600px). */
export const ARTICLE_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"] as const;
