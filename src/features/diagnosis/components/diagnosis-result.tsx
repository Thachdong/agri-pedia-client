"use client";

import { RefreshCwIcon } from "lucide-react";
import { notFound } from "next/navigation";
import { Button } from "@/shared/components/atoms";
import { Callout } from "@/shared/components/molecules";
import { DIAGNOSIS_ERROR_CODE } from "../constants/diagnosis.constants";
import { useDiagnosisLive } from "../hooks/use-diagnosis-live";
import { DiagnosisReportView } from "./diagnosis-report-view";
import { DiagnosisStatusPanel } from "./diagnosis-status-panel";

export type TDiagnosisResultProps = {
  id: string;
  /** Nút cạnh tiêu đề kết quả (vd. "Gửi báo cáo"). */
  actions?: React.ReactNode;
  className?: string;
};

/**
 * Trang kết quả chẩn đoán (cần RealtimeProvider): chờ kết quả (realtime + poll) → bảng tổng hợp → từng ảnh
 * → disclaimer. Tên bệnh ở 2 mục đầu mở dialog báo cáo bệnh.
 */
export function DiagnosisResult({ id, actions, className }: TDiagnosisResultProps) {
  const query = useDiagnosisLive(id);

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

  return (
    <DiagnosisReportView diagnosis={diagnosis} actions={actions} className={className}>
      <DiagnosisStatusPanel diagnosis={diagnosis} timedOut={query.timedOut} onReload={query.reload} />
    </DiagnosisReportView>
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
