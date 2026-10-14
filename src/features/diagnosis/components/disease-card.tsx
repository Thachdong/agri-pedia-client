import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/shared/components/atoms";
import { ROUTES } from "@/shared/constants";
import { cn } from "@/shared/lib/utils";
import { CATEGORY_LABELS } from "../constants/diagnosis.constants";
import type { TDisease } from "../types/knowledge.types";

/** Số dòng triệu chứng hiện trên thẻ. */
const SYMPTOM_PREVIEW = 3;

export type TDiseaseCardProps = { disease: TDisease; className?: string };

/** Thẻ bài viết bệnh liên quan: tên VN + tên khoa học, vài dòng triệu chứng, link chi tiết. */
export function DiseaseCard({ disease, className }: TDiseaseCardProps) {
  const unverified = disease.verification !== "SOURCED";

  return (
    <article className={cn("card-normal flex flex-col gap-3 rounded-lg p-4", className)}>
      <header className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold">{disease.nameVi}</h3>
          <Badge>{CATEGORY_LABELS[disease.category]}</Badge>
        </div>
        {disease.scientificName && <p className="text-sm text-muted-foreground italic">{disease.scientificName}</p>}
        {unverified && (
          <Badge tone="warning" className="self-start">
            Thông tin chưa được chuyên gia xác nhận
          </Badge>
        )}
      </header>
      {disease.symptoms.length > 0 && (
        <ul className="list-disc space-y-1 pl-4 text-sm">
          {disease.symptoms.slice(0, SYMPTOM_PREVIEW).map((symptom) => (
            <li key={symptom} className="line-clamp-2">
              {symptom}
            </li>
          ))}
        </ul>
      )}
      <Link
        href={ROUTES.disease(disease.code)}
        className="mt-auto inline-flex items-center gap-1 self-start rounded-sm text-sm font-medium text-highlight underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
      >
        Xem chi tiết
        <span className="sr-only"> về {disease.nameVi}</span>
        <ArrowRightIcon className="size-4" aria-hidden />
      </Link>
    </article>
  );
}

/** Khung chờ cùng kích thước thẻ. */
export function DiseaseCardSkeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("card-normal flex animate-pulse flex-col gap-3 rounded-lg p-4", className)}>
      <div className="h-5 w-2/3 rounded bg-muted-foreground/20" />
      <div className="h-4 w-1/2 rounded bg-muted-foreground/15" />
      <div className="h-4 w-full rounded bg-muted-foreground/15" />
      <div className="h-4 w-5/6 rounded bg-muted-foreground/15" />
    </div>
  );
}
