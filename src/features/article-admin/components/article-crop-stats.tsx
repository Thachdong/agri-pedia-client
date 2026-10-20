"use client";

import { RefreshCwIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge, Button } from "@/shared/components/atoms";
import { Callout } from "@/shared/components/molecules";
import { ROUTES } from "@/shared/constants";
import { cn } from "@/shared/lib/utils";
import { useAdminArticleCrops } from "../hooks/use-admin-article-crops";
import type { TAdminArticleCrop } from "../types/article-admin.types";

export type TArticleCropStatsProps = {
  /** Cây trong URL (`?crop=`); không có → cây đầu tiên (giống bảng bài viết). */
  cropSlug?: string;
  className?: string;
};

/**
 * Thống kê bài viết theo cây (Specs/19102026/admin.md): mỗi cây 1 thẻ — số bệnh / variant, có bài, đã publish,
 * còn thiếu. Bấm thẻ → chọn cây cho bảng bên dưới. Dữ liệu GET /admin/knowledge/crops (layout đã prefetch).
 */
export function ArticleCropStats({ cropSlug, className }: TArticleCropStatsProps) {
  const router = useRouter();
  const crops = useAdminArticleCrops();
  const selected = cropSlug ?? crops.data?.crops[0]?.slug;

  if (crops.isPending) {
    return (
      <ul aria-busy aria-label="Đang tải thống kê" className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
        {[0, 1, 2, 3].map((index) => (
          <li key={index} className="h-28 animate-pulse rounded-xl bg-muted" />
        ))}
      </ul>
    );
  }

  if (crops.isError) {
    return (
      <Callout
        tone="danger"
        role="alert"
        className={className}
        action={
          <Button size="sm" variant="outline" onClick={() => void crops.refetch()}>
            <RefreshCwIcon aria-hidden />
            Thử lại
          </Button>
        }
      >
        Không tải được thống kê bài viết.
      </Callout>
    );
  }

  if (crops.data.crops.length === 0) return null;

  return (
    <ul aria-label="Thống kê bài viết theo cây trồng" className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {crops.data.crops.map((crop) => (
        <li key={crop.slug}>
          <CropStatCard
            crop={crop}
            selected={crop.slug === selected}
            onSelect={() => router.replace(ROUTES.admin.articles.list(crop.slug))}
          />
        </li>
      ))}
    </ul>
  );
}

type TCropStatCardProps = { crop: TAdminArticleCrop; selected: boolean; onSelect: () => void };

function CropStatCard({ crop, selected, onSelect }: TCropStatCardProps) {
  const missing = crop.targetCount - crop.articleCount;
  const stats = [
    { label: "Có bài", value: crop.articleCount },
    { label: "Đã publish", value: crop.publishedCount },
    { label: "Còn thiếu", value: missing, warn: missing > 0 },
  ];

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex size-full flex-col gap-3 rounded-xl border-2 p-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "card-highlight" : "card-normal hover:border-highlight/50",
      )}
    >
      <span className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold">{crop.nameVi}</span>
        {crop.diagnosisEnabled && <Badge tone="info">Chẩn đoán</Badge>}
      </span>
      <span className="text-xs text-muted-foreground">{crop.targetCount} bệnh / biến thể</span>
      <dl className="grid grid-cols-3 gap-2 text-center">
        {stats.map(({ label, value, warn }) => (
          <div key={label} className="flex flex-col gap-0.5">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className={cn("text-lg font-semibold", warn && "text-warning")}>{value}</dd>
          </div>
        ))}
      </dl>
    </button>
  );
}
