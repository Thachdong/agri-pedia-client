import { useEffect, useState } from "react";

/**
 * Trạng thái quyền vị trí của trang, cập nhật khi người dùng đổi trong cài đặt trình duyệt.
 * `denied` → trình duyệt không hiện lại hộp hỏi; chỉ người dùng mở lại được (cài đặt trang cạnh thanh địa chỉ).
 * `null`: chưa đọc xong, trên server, hoặc trình duyệt không có Permissions API cho geolocation (khi đó chỉ biết qua
 * lỗi của getCurrentPosition).
 */
export function useGeolocationPermission() {
  const [permission, setPermission] = useState<PermissionState | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) return;

    let status: PermissionStatus | null = null;
    let cancelled = false;
    const sync = () => status && setPermission(status.state);

    navigator.permissions
      .query({ name: "geolocation" })
      .then((result) => {
        if (cancelled) return;
        status = result;
        sync();
        result.addEventListener("change", sync);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      status?.removeEventListener("change", sync);
    };
  }, []);

  return permission;
}
