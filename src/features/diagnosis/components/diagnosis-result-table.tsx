"use client";

import { Badge } from "@/shared/components/atoms";
import { cn } from "@/shared/lib/utils";
import { CATEGORY_LABELS } from "../constants/diagnosis.constants";
import type { TDiagnosisImage } from "../types/diagnosis.types";
import { formatLocation, regionsOfDisease, uniqueSymptoms } from "../utils/diagnosis-view.util";
import { ConfidenceBadge } from "./confidence-badge";
import { DiseaseNameButton } from "./disease-name-button";

export type TDiagnosisResultTableProps = {
  image: Pick<TDiagnosisImage, "diseases" | "regions" | "plantPart" | "detectedPart">;
  /** diseaseCode đang làm nổi trên ảnh. */
  highlightedCode?: string | null;
  onHighlightCode?: (code: string | null | undefined) => void;
  /** Bấm tên bệnh → mở báo cáo bệnh. */
  onOpenDisease: (code: string) => void;
  className?: string;
};

/**
 * Kết quả từng bệnh của 1 ảnh: tên bệnh (link báo cáo) + độ tin cậy + nhóm, vị trí (bộ phận · số vùng),
 * triệu chứng (gạch đầu dòng). Hover / focus hàng → làm nổi khung tương ứng trên ảnh.
 */
export function DiagnosisResultTable({
  image,
  highlightedCode,
  onHighlightCode,
  onOpenDisease,
  className,
}: TDiagnosisResultTableProps) {
  return (
    <ul className={cn("divide-y divide-border-subtle overflow-hidden rounded-lg border border-border-subtle", className)}>
      {image.diseases.map((disease) => {
        const regions = regionsOfDisease(image, disease.diseaseCode);
        const symptoms = uniqueSymptoms(regions);
        const active = highlightedCode === disease.diseaseCode;

        return (
          <li
            key={`${disease.diseaseCode}-${disease.variantCode ?? ""}`}
            onMouseEnter={() => onHighlightCode?.(disease.diseaseCode)}
            onMouseLeave={() => onHighlightCode?.(undefined)}
            className={cn("flex flex-col gap-2 px-4 py-3 transition-colors", active && "bg-highlight-subtle")}
          >
            <div className="flex flex-wrap items-center gap-2">
              <DiseaseNameButton
                name={disease.diseaseName}
                variantName={disease.variantName}
                onClick={() => onOpenDisease(disease.diseaseCode)}
                onFocus={() => onHighlightCode?.(disease.diseaseCode)}
                onBlur={() => onHighlightCode?.(undefined)}
              />
              <ConfidenceBadge level={disease.confidence.level} />
              <Badge>{CATEGORY_LABELS[disease.category]}</Badge>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
              <dt className="text-muted-foreground">Vị trí</dt>
              <dd>{formatLocation(image, regions.length)}</dd>
              <dt className="text-muted-foreground">Triệu chứng</dt>
              <dd>
                {symptoms.length > 0 ? (
                  <ul className="list-disc space-y-0.5 pl-4">
                    {symptoms.map((symptom) => (
                      <li key={symptom}>{symptom}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-muted-foreground">Không có mô tả</span>
                )}
              </dd>
            </dl>
          </li>
        );
      })}
    </ul>
  );
}
