import type { TCoordinates } from "@/shared/hooks";

export type TMapPickerProps = {
  /** Vị trí đang chọn (marker). `null` = chưa chọn. */
  value: TCoordinates | null;
  /** Click lên map hoặc kéo marker. */
  onChange: (coords: TCoordinates) => void;
  /** Điểm cần bay tới (vd: vị trí hiện tại) — không đổi `value`. */
  focus?: TCoordinates | null;
  className?: string;
  "aria-label"?: string;
};

export const SELECTED_ZOOM = 16;
