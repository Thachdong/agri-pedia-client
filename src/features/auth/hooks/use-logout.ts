import { ROUTES } from "@/shared/constants";
import { useAppMutation } from "@/shared/lib/query";
import { logout } from "../services/auth.service";

/**
 * Đăng xuất rồi tải lại toàn trang về "/": xoá sạch cache react-query, ngắt socket realtime,
 * server render lại nhánh guest. Không invalidate tại chỗ — query đang mount (vd. /users/me) sẽ refetch
 * khi cookie đã bị xoá → 401 → bị đẩy sang /login.
 */
export const useLogout = () =>
  useAppMutation({
    mutationFn: () => logout(),
    invalidates: false,
    onSuccess: () => {
      window.location.assign(ROUTES.home);
    },
  });
