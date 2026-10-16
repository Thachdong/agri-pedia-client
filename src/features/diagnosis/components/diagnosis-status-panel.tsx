import { CircleAlertIcon, ClockIcon, HistoryIcon, Loader2Icon, RefreshCwIcon, RotateCcwIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/shared/components/atoms";
import { ROUTES } from "@/shared/constants";
import { cn } from "@/shared/lib/utils";
import type { TDiagnosis } from "../types/diagnosis.types";

export type TDiagnosisStatusPanelProps = {
  diagnosis: Pick<TDiagnosis, "status" | "cropType" | "images">;
  /** Chờ quá 5 phút mà vẫn PROCESSING. */
  timedOut?: boolean;
  onReload?: () => void;
  className?: string;
};

const PANEL = "card-normal flex flex-col items-center gap-4 rounded-xl px-6 py-10 text-center";

/** Màn hình chờ / lỗi của trang kết quả: PROCESSING (spinner), quá thời gian chờ, FAILED (chẩn đoán lại). */
export function DiagnosisStatusPanel({ diagnosis, timedOut = false, onReload, className }: TDiagnosisStatusPanelProps) {
  if (diagnosis.status === "FAILED") {
    return (
      <section className={cn(PANEL, className)} aria-labelledby="diagnosis-status-title">
        <CircleAlertIcon className="size-10 text-destructive" aria-hidden />
        <h2 id="diagnosis-status-title" className="text-lg font-semibold">
          Không phân tích được ảnh, vui lòng thử lại
        </h2>
        <Button asChild variant="highlight">
          <Link href={ROUTES.diagnosis.new(diagnosis.cropType)}>
            <RotateCcwIcon aria-hidden />
            Chẩn đoán lại
          </Link>
        </Button>
      </section>
    );
  }

  const thumbnails = diagnosis.images.filter((image) => image.url);

  return (
    <section className={cn(PANEL, className)} aria-labelledby="diagnosis-status-title" aria-live="polite">
      {timedOut ? (
        <ClockIcon className="size-10 text-warning" aria-hidden />
      ) : (
        <Loader2Icon className="size-10 animate-spin text-highlight" aria-hidden />
      )}
      <div className="flex flex-col gap-1">
        <h2 id="diagnosis-status-title" className="text-lg font-semibold">
          {timedOut ? "Vẫn đang xử lý" : "Đang phân tích ảnh…"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {timedOut
            ? "Bạn có thể quay lại sau trong Lịch sử chẩn đoán."
            : "Thường mất 10–30 giây. Kết quả sẽ tự hiện khi xong."}
        </p>
      </div>
      {thumbnails.length > 0 && (
        <ul className="flex flex-wrap justify-center gap-2" aria-label="Ảnh đã gửi">
          {thumbnails.map((image) => (
            <li key={image.index} className="relative size-14 overflow-hidden rounded-md border border-border-subtle bg-muted">
              <Image src={image.url!} alt={`Ảnh ${image.index + 1}`} fill sizes="56px" unoptimized className="object-cover" />
            </li>
          ))}
        </ul>
      )}
      {timedOut && (
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={onReload}>
            <RefreshCwIcon aria-hidden />
            Tải lại
          </Button>
          <Button asChild variant="outline">
            <Link href={ROUTES.diagnosis.list}>
              <HistoryIcon aria-hidden />
              Lịch sử
            </Link>
          </Button>
        </div>
      )}
    </section>
  );
}
