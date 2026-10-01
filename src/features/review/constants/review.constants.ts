import type { TReviewTargetType } from "../types/review.types";

/** Mã lỗi domain của POST /reviews mà UI xử lý riêng. */
export const REVIEW_ERROR_CODE = {
  ALREADY_EXISTS: "REVIEW_ALREADY_EXISTS",
  REVIEWER_NOT_ALLOWED: "REVIEW_REVIEWER_NOT_ALLOWED",
  TARGET_NOT_FOUND: "REVIEW_TARGET_NOT_FOUND",
  INVALID_TARGET: "REVIEW_INVALID_TARGET",
} as const;

const REVIEWER_NOT_ALLOWED_MESSAGE = "Chỉ tài khoản nông dân đã kích hoạt mới được đánh giá.";

/** Message tiếng Việt thay cho message tiếng Anh của server, theo loại target. */
export const REVIEW_ERROR_MESSAGES: Record<TReviewTargetType, Record<string, string>> = {
  USER: {
    [REVIEW_ERROR_CODE.ALREADY_EXISTS]: "Bạn đã đánh giá shop này rồi.",
    [REVIEW_ERROR_CODE.REVIEWER_NOT_ALLOWED]: REVIEWER_NOT_ALLOWED_MESSAGE,
    [REVIEW_ERROR_CODE.TARGET_NOT_FOUND]: "Shop không còn tồn tại.",
    [REVIEW_ERROR_CODE.INVALID_TARGET]: "Shop hiện không nhận đánh giá.",
  },
  PRODUCT: {
    [REVIEW_ERROR_CODE.ALREADY_EXISTS]: "Bạn đã đánh giá sản phẩm này rồi.",
    [REVIEW_ERROR_CODE.REVIEWER_NOT_ALLOWED]: REVIEWER_NOT_ALLOWED_MESSAGE,
    [REVIEW_ERROR_CODE.TARGET_NOT_FOUND]: "Sản phẩm không còn tồn tại.",
    [REVIEW_ERROR_CODE.INVALID_TARGET]: "Sản phẩm đang ngừng bán, chưa thể đánh giá.",
  },
};

/** Gợi ý nội dung theo loại target. */
export const REVIEW_CONTENT_PLACEHOLDER: Record<TReviewTargetType, string> = {
  USER: "Chất lượng sản phẩm, tư vấn, giao hàng…",
  PRODUCT: "Chất lượng, đóng gói, giá cả…",
};

export const REVIEW_CONTENT_MAX = 1000;
