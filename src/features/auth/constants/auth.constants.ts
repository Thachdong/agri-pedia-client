import type { TBusinessType, TLoginType, TUserRole } from "../types/auth.types";

export const LOGIN_TYPES = ["EMAIL", "PHONE"] as const satisfies readonly TLoginType[];

/** Nhãn tab theo wireframe. */
export const LOGIN_TYPE_LABELS: Record<TLoginType, string> = {
  EMAIL: "EMAIL",
  PHONE: "PHONE",
};

/** Khớp OTP_LENGTH của server (default 6). */
export const OTP_CODE_LENGTH = 6;

export const IDENTIFIER_LABELS: Record<TLoginType, string> = {
  EMAIL: "Email",
  PHONE: "Số điện thoại",
};

export const ROLE_OPTIONS = [
  { value: "FARMER", label: "Nông dân", description: "Tài khoản dùng được ngay" },
  { value: "DISTRIBUTOR", label: "Nhà phân phối", description: "Cần kích hoạt bằng mã gửi về email/số điện thoại" },
] as const satisfies readonly { value: TUserRole; label: string; description: string }[];

export const BUSINESS_TYPE_OPTIONS = [
  { value: "AGRICULTURAL_CHEMICAL_SUPPLIES", label: "Vật tư nông nghiệp (phân bón, thuốc BVTV)" },
  { value: "SEEDS_SEEDLINGS", label: "Giống cây trồng" },
  { value: "AQUACULTURE_SEEDLINGS", label: "Giống thuỷ sản" },
] as const satisfies readonly { value: TBusinessType; label: string }[];

/** Domain error của POST /auth/register → field + message hiển thị. */
export const REGISTER_ERROR_FIELDS = {
  USER_IDENTIFIER_ALREADY_USED: { field: "identifier", message: "Email/số điện thoại này đã được đăng ký" },
  USER_LOCATION_INVALID: { field: "address.ward", message: "Phường/xã không thuộc tỉnh/thành đã chọn" },
  USER_INVALID_COORDINATES: { field: "address.lat", message: "Vị trí trên bản đồ không hợp lệ" },
  USER_BUSINESS_TYPE_REQUIRED: { field: "bussinessType", message: "Vui lòng chọn loại hình kinh doanh" },
  USER_BUSINESS_TYPE_NOT_ALLOWED: { field: "bussinessType", message: "Nông dân không chọn loại hình kinh doanh" },
} as const;
