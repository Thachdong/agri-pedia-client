"use client";

import { useId, useState } from "react";
import { cn } from "@/shared/lib/utils";
import { useCrops } from "../hooks/use-crops";
import type { TDiagnosis } from "../types/diagnosis.types";
import { DiagnosisResultImage } from "./diagnosis-result-image";
import { DiagnosisStatusBadge } from "./diagnosis-status-badge";
import { DiagnosisSummary } from "./diagnosis-summary";
import { DiseaseReportDialog } from "./disease-report-dialog";

const DATE_FORMAT = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" });

export type TDiagnosisReportViewProps = {
  diagnosis: TDiagnosis;
  /** Thẻ tiêu đề — trang: "h1"; trong dialog: DialogTitle. */
  titleAs?: React.ElementType;
  /** Nút bên phải tiêu đề (vd. "Gửi báo cáo" ở trang kết quả). */
  actions?: React.ReactNode;
  /** Thay phần kết quả khi chưa COMPLETED (vd. panel chờ / lỗi của trang kết quả). */
  children?: React.ReactNode;
  className?: string;
};

/**
 * Report 1 lần chẩn đoán (đã có dữ liệu): tiêu đề cây + thời gian + ghi chú → COMPLETED: bảng tổng hợp → từng ảnh
 * → disclaimer; chưa COMPLETED: `children`. Tên bệnh mở dialog báo cáo bệnh. Dùng ở trang kết quả và dialog report
 * trong chat.
 */
export function DiagnosisReportView({
  diagnosis,
  titleAs: Title = "h1",
  actions,
  children,
  className,
}: TDiagnosisReportViewProps) {
  const crops = useCrops();
  const cropName = crops.data?.find((crop) => crop.code === diagnosis.cropType)?.nameVi;

  return (
    // min-w-0: trong grid của Dialog, bảng tổng hợp (min-w 44rem) chỉ cuộn trong khung bảng, không kéo rộng cả dialog.
    <div className={cn("flex min-w-0 flex-col gap-6", className)}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <Title className="text-2xl font-bold">Kết quả chẩn đoán{cropName && ` — ${cropName}`}</Title>
            <DiagnosisStatusBadge status={diagnosis.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            <time dateTime={diagnosis.createdAt}>{DATE_FORMAT.format(new Date(diagnosis.createdAt))}</time>
            {diagnosis.note && <> · Ghi chú: {diagnosis.note}</>}
          </p>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </header>

      {diagnosis.status === "COMPLETED" ? <CompletedResult diagnosis={diagnosis} /> : children}
    </div>
  );
}

function CompletedResult({ diagnosis }: { diagnosis: TDiagnosis }) {
  const [diseaseCode, setDiseaseCode] = useState<string | null>(null);
  // Trang và dialog report có thể cùng mở → id tiêu đề không cố định.
  const imagesTitleId = useId();
  const images = [...diagnosis.images].sort((a, b) => a.index - b.index);
  return (
    <>
      <DiagnosisSummary diagnosis={diagnosis} onOpenDisease={setDiseaseCode} />
      <section aria-labelledby={imagesTitleId} className="flex flex-col gap-3">
        <h2 id={imagesTitleId} className="text-lg font-semibold">
          Kết quả từng ảnh
        </h2>
        {images.map((image) => (
          <DiagnosisResultImage key={image.index} image={image} cropType={diagnosis.cropType} onOpenDisease={setDiseaseCode} />
        ))}
      </section>
      <p className="text-xs text-muted-foreground">{diagnosis.disclaimer}</p>
      <DiseaseReportDialog code={diseaseCode} cropType={diagnosis.cropType} onClose={() => setDiseaseCode(null)} />
    </>
  );
}
