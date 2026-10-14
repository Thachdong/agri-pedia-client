"use client";

import { Badge } from "@/shared/components/atoms";
import { cn } from "@/shared/lib/utils";
import { CATEGORY_LABELS } from "../constants/diagnosis.constants";
import type { TDiagnosisImage } from "../types/diagnosis.types";
import { ConfidenceBadge } from "./confidence-badge";

export type TDiagnosisResultTableProps = {
  image: Pick<TDiagnosisImage, "diseases" | "regions">;
  /** diseaseCode đang làm nổi trên ảnh. */
  highlightedCode?: string | null;
  onHighlightCode?: (code: string | null | undefined) => void;
  className?: string;
};

/**
 * Kết quả từng bệnh của 1 ảnh: bệnh (+ biến thể), nhóm, triệu chứng (từ các vùng của bệnh đó), độ tin cậy, số vùng.
 * Mỗi bệnh là 1 hàng thẻ (đọc được cả ở mobile / cột hẹp). Hover / chạm hàng → làm nổi khung tương ứng trên ảnh.
 */
export function DiagnosisResultTable({ image, highlightedCode, onHighlightCode, className }: TDiagnosisResultTableProps) {
  return (
    <ul className={cn("divide-y divide-border-subtle overflow-hidden rounded-lg border border-border-subtle", className)}>
      {image.diseases.map((disease) => {
        const regions = image.regions.filter((region) => region.diagnosis?.diseaseCode === disease.diseaseCode);
        const symptoms = [...new Set(regions.map((region) => region.symptom))];
        const active = highlightedCode === disease.diseaseCode;

        return (
          <li
            key={`${disease.diseaseCode}-${disease.variantCode ?? ""}`}
            onMouseEnter={() => onHighlightCode?.(disease.diseaseCode)}
            onMouseLeave={() => onHighlightCode?.(undefined)}
            className={cn("transition-colors", active && "bg-highlight-subtle")}
          >
            <button
              type="button"
              onClick={() => onHighlightCode?.(active ? undefined : disease.diseaseCode)}
              aria-pressed={active}
              className="flex w-full flex-col gap-2 px-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            >
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-medium">
                  {disease.diseaseName}
                  {disease.variantName && <span className="font-normal text-muted-foreground"> — {disease.variantName}</span>}
                </span>
                <ConfidenceBadge level={disease.confidence.level} />
              </span>
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <Badge>{CATEGORY_LABELS[disease.category]}</Badge>
                <span>{regions.length > 0 ? `${regions.length} vùng trên ảnh` : "Không khoanh vùng"}</span>
              </span>
              {symptoms.length > 0 && (
                <span className="text-sm">
                  <span className="text-muted-foreground">Triệu chứng: </span>
                  {symptoms.join("; ")}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
