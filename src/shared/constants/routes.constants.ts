/** Đường dẫn trang (không phải API) — nơi duy nhất viết path. */
export const ROUTES = {
  home: "/",
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    activate: "/auth/activate",
    resetPassword: "/auth/reset-password",
    changePassword: "/auth/change-password",
  },
  /** Trang profile của user (ui-ux.md §7) — id là UUID, encode phòng trường hợp ký tự lạ. */
  profile: (id: string) => `/profile/${encodeURIComponent(id)}`,
  /** Trang hồ sơ của chính mình (FARMER; DISTRIBUTOR được chuyển sang `profile(id)`) — cần đăng nhập. */
  myProfile: "/profile/me",
  /** Chẩn đoán bệnh cây trồng — cần đăng nhập. */
  diagnosis: {
    /** Lịch sử chẩn đoán của tôi. */
    list: "/diagnosis",
    /** Form chụp / chọn ảnh cho 1 loại cây (`cropType` của GET /knowledge/crops, vd. RICE). */
    new: (crop: string) => `/diagnosis/new?crop=${encodeURIComponent(crop)}`,
    detail: (id: string) => `/diagnosis/${encodeURIComponent(id)}`,
  },
  /** Bài viết chi tiết 1 bệnh (public) — `code` là diseaseCode. */
  disease: (code: string) => `/diseases/${encodeURIComponent(code)}`,
} as const;
