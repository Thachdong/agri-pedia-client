"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/atoms";
import { cn } from "@/shared/lib/utils";
import { CONFIDENCE_LABELS } from "../constants/diagnosis.constants";
import type { TConfidenceLevel, TDiagnosisRegion } from "../types/diagnosis.types";
import { ConfidenceBadge } from "./confidence-badge";

const UNCERTAIN_NAME = "Chưa xác định";

/** Khung + nhãn theo mức tin cậy; vùng chưa xác định = xám nét đứt. */
const BOX_TONES: Record<TConfidenceLevel | "UNCERTAIN", { box: string; label: string }> = {
  HIGH: { box: "border-success", label: "bg-success text-success-foreground" },
  MEDIUM: { box: "border-warning", label: "bg-warning text-warning-foreground" },
  LOW: { box: "border-muted-foreground", label: "bg-muted-foreground text-background" },
  UNCERTAIN: { box: "border-dashed border-muted-foreground", label: "bg-muted-foreground text-background" },
};

const toPercent = (value: number) => `${Math.min(Math.max(value, 0), 1) * 100}%`;

export const regionName = ({ diagnosis }: TDiagnosisRegion) =>
  diagnosis ? (diagnosis.variantName ?? diagnosis.diseaseName) : UNCERTAIN_NAME;

export type TRegionOverlayProps = {
  regions: TDiagnosisRegion[];
  /** diseaseCode đang được làm nổi (hover hàng bảng / khung); `null` = vùng chưa xác định. */
  highlightedCode?: string | null;
  onHighlightCode?: (code: string | null | undefined) => void;
  /** Ẩn nhãn tên trên khung (vd. ảnh nhỏ). */
  showLabels?: boolean;
  className?: string;
};

/**
 * Phủ lên ảnh (cha `relative`, đúng kích thước ảnh hiển thị): mỗi `box` (0..1) → 1 khung theo %, co giãn theo ảnh.
 * Chạm / hover / focus khung → popover triệu chứng, đặc điểm, tên bệnh, mức tin cậy.
 */
export function RegionOverlay({
  regions,
  highlightedCode,
  onHighlightCode,
  showLabels = true,
  className,
}: TRegionOverlayProps) {
  const hasHighlight = highlightedCode !== undefined;

  return (
    <div className={cn("pointer-events-none absolute inset-0", className)}>
      {regions.map((region, index) => {
        const { box, diagnosis, symptom, features } = region;
        const tone = BOX_TONES[diagnosis?.confidence.level ?? "UNCERTAIN"];
        const name = regionName(region);
        const code = diagnosis?.diseaseCode ?? null;
        const active = hasHighlight && highlightedCode === code;
        const dimmed = hasHighlight && !active;
        const ariaLabel = `Vùng ${index + 1}: ${name}${diagnosis ? `, tin cậy ${CONFIDENCE_LABELS[diagnosis.confidence.level].toLowerCase()}` : ""}`;

        return (
          <Popover key={index}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label={ariaLabel}
                onMouseEnter={() => onHighlightCode?.(code)}
                onMouseLeave={() => onHighlightCode?.(undefined)}
                onFocus={() => onHighlightCode?.(code)}
                onBlur={() => onHighlightCode?.(undefined)}
                style={{ left: toPercent(box.x), top: toPercent(box.y), width: toPercent(box.w), height: toPercent(box.h) }}
                className={cn(
                  "pointer-events-auto absolute rounded-sm border-2 shadow-[0_0_0_1px] shadow-background/60 outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-ring",
                  tone.box,
                  active && "border-[3px] bg-background/15",
                  dimmed && "opacity-40",
                )}
              >
                {showLabels && (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute bottom-full left-[-2px] mb-0.5 max-w-40 truncate rounded-sm px-1 py-px text-[0.6875rem] leading-tight font-medium",
                      tone.label,
                    )}
                  >
                    {name}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent side="top" className="gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{name}</p>
                {diagnosis && <ConfidenceBadge level={diagnosis.confidence.level} />}
              </div>
              {diagnosis?.variantName && <p className="text-xs text-muted-foreground">{diagnosis.diseaseName}</p>}
              <p>{symptom}</p>
              {features.length > 0 && (
                <ul className="list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
                  {features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              )}
            </PopoverContent>
          </Popover>
        );
      })}
    </div>
  );
}
