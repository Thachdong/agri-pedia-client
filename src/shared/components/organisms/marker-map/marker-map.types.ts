import type { TCoordinates } from "@/shared/hooks";

export type TMapMarker = {
  id: string;
  position: TCoordinates;
  /** Hiện ở tooltip + title (a11y). */
  label: string;
};

export type TMarkerMapProps = {
  /** Thứ tự có ý nghĩa: các marker đầu được dùng để fit khung nhìn quanh `userLocation`. */
  markers: TMapMarker[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** Vị trí người xem — có thì hiện chấm vị trí + fit khung quanh nó. */
  userLocation?: TCoordinates | null;
  /** Nhãn luôn hiện cạnh vị trí người xem. */
  userLabel?: string;
  className?: string;
  "aria-label"?: string;
};

export const DEFAULT_USER_LABEL = "Bạn ở đây";

/** Số marker đầu (gần nhất) được đưa vào khung nhìn cùng vị trí người xem. */
export const FIT_NEAREST_COUNT = 5;
export const FIT_MAX_ZOOM = 14;
/** Có vị trí người xem nhưng chưa có marker nào. */
export const USER_ONLY_ZOOM = 12;
