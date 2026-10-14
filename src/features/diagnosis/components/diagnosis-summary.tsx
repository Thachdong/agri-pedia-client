import { CircleCheckIcon, SearchXIcon, StethoscopeIcon } from "lucide-react";
import { Callout } from "@/shared/components/molecules";
import { cn } from "@/shared/lib/utils";
import type { TDiagnosis } from "../types/diagnosis.types";
import { ConfidenceBadge } from "./confidence-badge";

export type TDiagnosisSummaryProps = {
  diagnosis: Pick<TDiagnosis, "summary" | "images">;
  className?: string;
};

/** Kết luận chung của ca: danh sách bệnh (mức tin cậy, số ảnh) hoặc không phát hiện / chưa xác định. */
export function DiagnosisSummary({ diagnosis, className }: TDiagnosisSummaryProps) {
  const { summary, images } = diagnosis;
  const total = images.length;
  const allHealthy = total > 0 && images.every((image) => image.status === "HEALTHY");

  let body: React.ReactNode;
  if (summary?.hasDisease) {
    // Sắp theo score (chưa hiệu chỉnh nên không hiển thị).
    const diseases = [...summary.diseases].sort((a, b) => b.confidence.score - a.confidence.score);
    body = (
      <>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <StethoscopeIcon className="size-5 text-highlight" aria-hidden />
          Phát hiện {diseases.length} bệnh có thể có
        </h2>
        <ul className="flex flex-col divide-y divide-border-subtle">
          {diseases.map((disease) => (
            <li key={disease.diseaseCode} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
              <span className="font-medium">{disease.diseaseName}</span>
              <ConfidenceBadge level={disease.confidence.level} />
              <span className="ml-auto text-sm text-muted-foreground tabular-nums">
                {disease.imageCount}/{total} ảnh
              </span>
            </li>
          ))}
        </ul>
        {summary.conflict && (
          <Callout tone="warning">Các ảnh cho kết quả khác nhau, nên kiểm tra thêm.</Callout>
        )}
      </>
    );
  } else if (allHealthy) {
    body = (
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <CircleCheckIcon className="size-5 text-success" aria-hidden />
        Không phát hiện dấu hiệu bệnh
      </h2>
    );
  } else {
    body = (
      <div className="flex flex-col gap-1">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <SearchXIcon className="size-5 text-muted-foreground" aria-hidden />
          Chưa xác định được bệnh
        </h2>
        <p className="text-sm text-muted-foreground">Vui lòng thử ảnh khác (chụp gần, rõ vết bệnh).</p>
      </div>
    );
  }

  return (
    <section aria-label="Kết luận" className={cn("card-normal flex flex-col gap-3 rounded-xl p-4 sm:p-5", className)}>
      {body}
    </section>
  );
}
