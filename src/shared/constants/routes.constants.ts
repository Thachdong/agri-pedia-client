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
  /** Bài viết bệnh cây trồng (public, ISR, SEO) — slug lấy từ API (`crop.slug`, `article.slug`). */
  articles: {
    index: "/benh-cay-trong",
    crop: (cropSlug: string) => `/benh-cay-trong/${encodeURIComponent(cropSlug)}`,
    detail: (cropSlug: string, slug: string) =>
      `/benh-cay-trong/${encodeURIComponent(cropSlug)}/${encodeURIComponent(slug)}`,
  },
  /** Khu quản trị — chỉ ADMIN (proxy điều hướng theo cookie role, layout `/admin` kiểm role thật). */
  admin: {
    root: "/admin",
    articles: {
      /** Bảng bệnh + bài viết của 1 cây; không có `crop` → cây đầu tiên. */
      list: (crop?: string) => (crop ? `/admin/articles?crop=${encodeURIComponent(crop)}` : "/admin/articles"),
      /** Viết bài cho 1 bệnh / variant chưa có bài; không có `code` → chọn bệnh (của `crop`) trước. */
      new: (target?: { crop: string; code?: string }) => {
        if (!target) return "/admin/articles/new";
        const params = new URLSearchParams({ crop: target.crop, ...(target.code && { code: target.code }) });
        return `/admin/articles/new?${params}`;
      },
      detail: (code: string) => `/admin/articles/${encodeURIComponent(code)}`,
      edit: (code: string) => `/admin/articles/${encodeURIComponent(code)}/edit`,
    },
  },
} as const;
