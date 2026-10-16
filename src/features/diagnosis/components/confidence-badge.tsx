import { Badge, type TBadgeProps, type TBadgeTone } from "@/shared/components/atoms";
import { CONFIDENCE_LABELS } from "../constants/diagnosis.constants";
import type { TConfidenceLevel } from "../types/diagnosis.types";

const CONFIDENCE_TONES: Record<TConfidenceLevel, TBadgeTone> = {
  HIGH: "success",
  MEDIUM: "warning",
  LOW: "neutral",
};

export type TConfidenceBadgeProps = Omit<TBadgeProps, "tone" | "children"> & { level: TConfidenceLevel };

/** Mức tin cậy của AI: Cao (xanh) / Trung bình (vàng) / Thấp (xám). `score` không hiển thị (chưa hiệu chỉnh). */
export function ConfidenceBadge({ level, ...props }: TConfidenceBadgeProps) {
  return (
    <Badge tone={CONFIDENCE_TONES[level]} {...props}>
      Tin cậy: {CONFIDENCE_LABELS[level]}
    </Badge>
  );
}
