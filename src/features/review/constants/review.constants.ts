/** Mã lỗi domain của POST /reviews mà UI xử lý riêng. */
export const REVIEW_ERROR_CODE = {
  ALREADY_EXISTS: "REVIEW_ALREADY_EXISTS",
  REVIEWER_NOT_ALLOWED: "REVIEW_REVIEWER_NOT_ALLOWED",
  TARGET_NOT_FOUND: "REVIEW_TARGET_NOT_FOUND",
  INVALID_TARGET: "REVIEW_INVALID_TARGET",
} as const;

/** Message tiếng Việt thay cho message tiếng Anh của server. */
export const REVIEW_SHOP_ERROR_MESSAGES: Record<string, string> = {
  [REVIEW_ERROR_CODE.ALREADY_EXISTS]: "Bạn đã đánh giá shop này rồi.",
  [REVIEW_ERROR_CODE.REVIEWER_NOT_ALLOWED]: "Chỉ tài khoản nông dân đã kích hoạt mới được đánh giá.",
  [REVIEW_ERROR_CODE.TARGET_NOT_FOUND]: "Shop không còn tồn tại.",
  [REVIEW_ERROR_CODE.INVALID_TARGET]: "Shop hiện không nhận đánh giá.",
};

export const REVIEW_CONTENT_MAX = 1000;
