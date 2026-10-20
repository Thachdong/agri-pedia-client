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

/** Mã lỗi domain của API admin bài viết. */
export const ARTICLE_ADMIN_ERROR_CODE = {
  invalidContent: "KNOWLEDGE_ARTICLE_INVALID_CONTENT",
  imageInvalid: "KNOWLEDGE_ARTICLE_IMAGE_INVALID",
  alreadyExists: "KNOWLEDGE_ARTICLE_ALREADY_EXISTS",
  slugTaken: "KNOWLEDGE_ARTICLE_SLUG_TAKEN",
  articleNotFound: "KNOWLEDGE_ARTICLE_NOT_FOUND",
  diseaseNotFound: "KNOWLEDGE_DISEASE_NOT_FOUND",
  cropNotFound: "KNOWLEDGE_CROP_NOT_FOUND",
  adminRequired: "KNOWLEDGE_ADMIN_REQUIRED",
} as const;

/** Thông báo cho lỗi không gắn được vào 1 field của form. */
export const ARTICLE_ADMIN_ERROR_MESSAGES: Record<string, string> = {
  [ARTICLE_ADMIN_ERROR_CODE.imageInvalid]: "Có ảnh không xử lý được (sai định dạng hoặc chưa upload xong). Hãy chọn lại ảnh.",
  [ARTICLE_ADMIN_ERROR_CODE.alreadyExists]: "Bệnh này đã có bài viết — hãy sửa bài đó thay vì tạo mới.",
  [ARTICLE_ADMIN_ERROR_CODE.articleNotFound]: "Bài viết không còn tồn tại.",
  [ARTICLE_ADMIN_ERROR_CODE.diseaseNotFound]: "Không tìm thấy bệnh của bài viết (hoặc variant chưa có bài của bệnh chính).",
  [ARTICLE_ADMIN_ERROR_CODE.cropNotFound]: "Không tìm thấy cây trồng.",
  [ARTICLE_ADMIN_ERROR_CODE.adminRequired]: "Chỉ tài khoản quản trị được thực hiện thao tác này.",
};
