import { ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CATEGORY_LABELS } from "@/features/diagnosis";
import { cn } from "@/shared/lib/utils";
import type { TRelatedDisease } from "../types/article.types";
import { CategoryPlaceholder } from "./category-placeholder";

export type TDiseaseCardProps = {
  disease: TRelatedDisease;
  className?: string;
};

/** Thẻ bệnh dễ nhầm / liên quan (cuối bài và directive `::disease-card`). `path` null = chưa có bài → không link. */
export function DiseaseCard({ disease, className }: TDiseaseCardProps) {
  const body = (
    <>
      <div className="relative aspect-4/3 w-24 shrink-0 overflow-hidden rounded-md bg-surface sm:w-28">
        {disease.coverUrl ? (
          <Image src={disease.coverUrl} alt="" fill sizes="7rem" className="object-cover" />
        ) : (
          <CategoryPlaceholder category={disease.category} size="sm" showLabel={false} className="size-full" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="font-medium text-foreground">{disease.nameVi}</span>
        <span className="text-sm text-muted-foreground">{CATEGORY_LABELS[disease.category]}</span>
        {!disease.path && <span className="text-xs text-muted-foreground">Chưa có bài viết</span>}
      </div>
      {disease.path && <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
    </>
  );
  const classes = cn("card-normal not-prose flex items-center gap-3 rounded-lg p-2", className);

  if (!disease.path) return <div className={classes}>{body}</div>;
  return (
    <Link
      href={disease.path}
      className={cn(classes, "outline-none transition-colors hover:border-primary focus-visible:ring-2 focus-visible:ring-ring")}
    >
      {body}
    </Link>
  );
}
