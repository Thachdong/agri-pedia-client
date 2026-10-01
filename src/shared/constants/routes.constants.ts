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
} as const;
