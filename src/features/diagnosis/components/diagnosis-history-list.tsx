"use client";

import { HistoryIcon, Loader2Icon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/shared/components/atoms";
import { Callout } from "@/shared/components/molecules";
import { useInfiniteSentinel } from "@/shared/hooks";
import { cn } from "@/shared/lib/utils";
import { useDiagnosisHistory } from "../hooks/use-diagnosis-history";
import { DiagnosisHistoryItem } from "./diagnosis-history-item";
import { StartDiagnosisButton } from "./start-diagnosis-button";

const SKELETON_ROWS = 4;

export type TDiagnosisHistoryListProps = { className?: string };

/** Lịch sử chẩn đoán của tôi (mới nhất trước, cuộn để tải thêm); rỗng → mời chẩn đoán. */
export function DiagnosisHistoryList({ className }: TDiagnosisHistoryListProps) {
  const query = useDiagnosisHistory();
  const sentinelRef = useInfiniteSentinel<HTMLLIElement>(query);
  // Lấy trước khi thu hẹp kiểu theo status (lỗi trang kế cũng làm `isError` = true).
  const { fetchNextPage, isFetchNextPageError } = query;

  if (query.isPending) {
    return (
      <ul className={cn("flex flex-col gap-2", className)} aria-busy aria-label="Đang tải lịch sử chẩn đoán">
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <li key={index} className="flex animate-pulse items-center gap-3 px-3 py-3">
            <div className="size-16 rounded-md bg-muted" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-3 w-24 rounded bg-muted" />
              <div className="h-4 w-1/2 rounded bg-muted" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (query.isError && !isFetchNextPageError) {
    return (
      <Callout
        tone="danger"
        role="alert"
        title="Không tải được lịch sử chẩn đoán"
        action={
          <Button size="sm" variant="outline" onClick={() => void query.refetch()}>
            <RefreshCwIcon aria-hidden />
            Thử lại
          </Button>
        }
        className={className}
      />
    );
  }

  if (query.data.length === 0) {
    return (
      <div className={cn("card-normal flex flex-col items-center gap-3 rounded-xl px-6 py-12 text-center", className)}>
        <HistoryIcon className="size-10 text-muted-foreground" aria-hidden />
        <p className="font-medium">Chưa có lần chẩn đoán nào</p>
        <StartDiagnosisButton label="Chẩn đoán ngay" size="default" variant="highlight" />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <ul className="flex flex-col divide-y divide-border-subtle rounded-xl border border-border-subtle">
        {query.data.map((item) => (
          <DiagnosisHistoryItem key={item.id} item={item} />
        ))}
        {query.hasNextPage && <li ref={sentinelRef} aria-hidden className="h-px" />}
      </ul>
      {query.isFetchingNextPage && (
        <p className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" aria-hidden />
          Đang tải thêm…
        </p>
      )}
      {isFetchNextPageError && (
        <Button variant="outline" size="sm" className="self-center" onClick={() => void fetchNextPage()}>
          <RefreshCwIcon aria-hidden />
          Tải thêm
        </Button>
      )}
    </div>
  );
}
