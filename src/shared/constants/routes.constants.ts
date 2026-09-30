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
} as const;
