import { ChevronRightIcon, ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/shared/constants";
import { cn } from "@/shared/lib/utils";
import type { TDiagnosisListItem } from "../types/diagnosis.types";
import { ConfidenceBadge } from "./confidence-badge";
import { DiagnosisStatusBadge } from "./diagnosis-status-badge";

const DATE_FORMAT = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" });

export type TDiagnosisHistoryItemProps = { item: TDiagnosisListItem; className?: string };

/** 1 dòng lịch sử: ảnh đầu, thời gian, trạng thái hoặc các bệnh phát hiện → mở trang kết quả. */
export function DiagnosisHistoryItem({ item, className }: TDiagnosisHistoryItemProps) {
  const completed = item.status === "COMPLETED";

  return (
    <li className={className}>
      <Link
        href={ROUTES.diagnosis.detail(item.id)}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-3 outline-none transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        <span className="relative size-16 shrink-0 overflow-hidden rounded-md border border-border-subtle bg-muted">
          {item.thumbnail ? (
            <Image src={item.thumbnail} alt="" fill sizes="64px" unoptimized className="object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center text-muted-foreground">
              <ImageIcon className="size-5" aria-hidden />
            </span>
          )}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
          <time dateTime={item.createdAt} className="text-xs text-muted-foreground">
            {DATE_FORMAT.format(new Date(item.createdAt))}
          </time>
          {!completed ? (
            <DiagnosisStatusBadge status={item.status} className="self-start" />
          ) : item.diseases.length === 0 ? (
            <span className="text-sm font-medium">Không phát hiện bệnh</span>
          ) : (
            <span className="flex flex-col gap-1">
              {item.diseases.map((disease) => (
                <span key={disease.diseaseCode} className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-medium">{disease.diseaseName}</span>
                  <ConfidenceBadge level={disease.confidenceLevel} />
                </span>
              ))}
            </span>
          )}
        </span>
        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </Link>
    </li>
  );
}
