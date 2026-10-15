"use client";

import { RefreshCwIcon } from "lucide-react";
import { notFound } from "next/navigation";
import { useState } from "react";
import { Button } from "@/shared/components/atoms";
import { Callout } from "@/shared/components/molecules";
import { cn } from "@/shared/lib/utils";
import { DIAGNOSIS_ERROR_CODE } from "../constants/diagnosis.constants";
import { useCrops } from "../hooks/use-crops";
import { useDiagnosisLive } from "../hooks/use-diagnosis-live";
import type { TDiagnosis } from "../types/diagnosis.types";
import { DiagnosisResultImage } from "./diagnosis-result-image";
import { DiagnosisStatusBadge } from "./diagnosis-status-badge";
import { DiagnosisStatusPanel } from "./diagnosis-status-panel";
import { DiagnosisSummary } from "./diagnosis-summary";
import { DiseaseReportDialog } from "./disease-report-dialog";

const DATE_FORMAT = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" });

export type TDiagnosisResultProps = { id: string; className?: string };

/**
 * Trang kết quả chẩn đoán (cần RealtimeProvider): chờ kết quả (realtime + poll) → bảng tổng hợp → từng ảnh
 * → disclaimer. Tên bệnh ở 2 mục đầu mở dialog báo cáo bệnh.
 */
export function DiagnosisResult({ id, className }: TDiagnosisResultProps) {
  const query = useDiagnosisLive(id);
  const crops = useCrops();

  if (query.isPending) return <ResultSkeleton />;

  if (query.isError) {
    if (query.error.code === DIAGNOSIS_ERROR_CODE.notFound) notFound();
    return (
      <Callout
        tone="danger"
        role="alert"
        title="Không tải được kết quả chẩn đoán"
        action={
          <Button size="sm" variant="outline" onClick={() => void query.refetch()}>
            <RefreshCwIcon aria-hidden />
            Thử lại
          </Button>
        }
      >
        {query.error.message}
      </Callout>
    );
  }

  const diagnosis = query.data;
  const cropName = crops.data?.find((crop) => crop.code === diagnosis.cropType)?.nameVi;

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <header className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold">Kết quả chẩn đoán{cropName && ` — ${cropName}`}</h1>
          <DiagnosisStatusBadge status={diagnosis.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          <time dateTime={diagnosis.createdAt}>{DATE_FORMAT.format(new Date(diagnosis.createdAt))}</time>
          {diagnosis.note && <> · Ghi chú: {diagnosis.note}</>}
        </p>
      </header>

      {diagnosis.status === "COMPLETED" ? (
        <CompletedResult diagnosis={diagnosis} />
      ) : (
        <DiagnosisStatusPanel diagnosis={diagnosis} timedOut={query.timedOut} onReload={query.reload} />
      )}
    </div>
  );
}

function CompletedResult({ diagnosis }: { diagnosis: TDiagnosis }) {
  const [diseaseCode, setDiseaseCode] = useState<string | null>(null);
  const images = [...diagnosis.images].sort((a, b) => a.index - b.index);
  return (
    <>
      <DiagnosisSummary diagnosis={diagnosis} onOpenDisease={setDiseaseCode} />
      <section aria-labelledby="diagnosis-images-title" className="flex flex-col gap-3">
        <h2 id="diagnosis-images-title" className="text-lg font-semibold">
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

function ResultSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6" aria-busy aria-label="Đang tải kết quả chẩn đoán">
      <div className="h-8 w-2/3 rounded bg-muted" />
      <div className="h-32 rounded-xl bg-muted" />
      <div className="h-72 rounded-xl bg-muted" />
    </div>
  );
}
