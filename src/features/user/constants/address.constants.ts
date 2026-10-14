/** Mã lỗi NestJS của các action address (POST / PATCH primary / DELETE /users/me/addresses). */
export const ADDRESS_ERROR_CODE = {
  NOT_FOUND: "USER_ADDRESS_NOT_FOUND",
  PRIMARY_NOT_DELETABLE: "USER_ADDRESS_PRIMARY_NOT_DELETABLE",
  INVALID_COORDINATES: "USER_INVALID_COORDINATES",
  LOCATION_INVALID: "USER_LOCATION_INVALID",
} as const;

/** Message tiếng Việt thay cho message tiếng Anh của server. */
export const ADDRESS_ERROR_MESSAGES: Record<string, string> = {
  [ADDRESS_ERROR_CODE.NOT_FOUND]: "Địa chỉ không còn tồn tại.",
  [ADDRESS_ERROR_CODE.PRIMARY_NOT_DELETABLE]: "Không thể xoá địa chỉ mặc định. Hãy chọn địa chỉ khác làm mặc định trước.",
  [ADDRESS_ERROR_CODE.INVALID_COORDINATES]: "Vị trí trên bản đồ không hợp lệ.",
  [ADDRESS_ERROR_CODE.LOCATION_INVALID]: "Tỉnh/thành hoặc phường/xã không hợp lệ, vui lòng chọn lại.",
};
