import { LOGIN_NEXT_PARAM, LOGIN_PATH } from "@/shared/lib/auth/auth.constants";
import { APP_ERROR_CODE } from "./app-error";
import { createHttpClient } from "./create-http-client";

/** Client cho browser: gọi BFF (`/api/*` → NestJS). Chỉ dùng trong Client Components / hooks. */
export const http = createHttpClient({
  baseUrl: "/api",
  credentials: "same-origin",
  onError: (error) => {
    if (typeof window === "undefined") return;
    if (error.status === 401 && error.code === APP_ERROR_CODE.SESSION_EXPIRED) {
      const next = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
      // Reload toàn trang có chủ đích: xóa cache react-query của phiên cũ; code này chạy ngoài React nên không dùng router.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`${LOGIN_PATH}?${LOGIN_NEXT_PARAM}=${next}`);
    }
  },
});
