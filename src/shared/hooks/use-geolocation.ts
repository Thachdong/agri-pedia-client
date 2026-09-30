import { useCallback, useState } from "react";

export type TCoordinates = { lat: number; long: number };

export type TGeolocationStatus = "idle" | "loading" | "success" | "error";

const DEFAULT_OPTIONS: PositionOptions = { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 };

const ERROR_MESSAGES: Record<number, string> = {
  1: "Bạn đã từ chối quyền truy cập vị trí",
  2: "Không xác định được vị trí hiện tại",
  3: "Lấy vị trí quá thời gian, vui lòng thử lại",
};
const UNSUPPORTED_MESSAGE = "Trình duyệt không hỗ trợ lấy vị trí";

/**
 * Lấy vị trí hiện tại theo yêu cầu (không tự chạy khi mount).
 * `request()` resolve toạ độ, hoặc `null` khi lỗi (lỗi nằm ở `error`).
 */
export function useGeolocation(options: PositionOptions = DEFAULT_OPTIONS) {
  const [status, setStatus] = useState<TGeolocationStatus>("idle");
  const [coords, setCoords] = useState<TCoordinates | null>(null);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(
    () =>
      new Promise<TCoordinates | null>((resolve) => {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
          setStatus("error");
          setError(UNSUPPORTED_MESSAGE);
          resolve(null);
          return;
        }

        setStatus("loading");
        setError(null);
        navigator.geolocation.getCurrentPosition(
          ({ coords: position }) => {
            const next = { lat: position.latitude, long: position.longitude };
            setCoords(next);
            setStatus("success");
            resolve(next);
          },
          (positionError) => {
            setStatus("error");
            setError(ERROR_MESSAGES[positionError.code] ?? ERROR_MESSAGES[2]);
            resolve(null);
          },
          options,
        );
      }),
    [options],
  );

  return { status, coords, error, isLoading: status === "loading", request };
}
