"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/atoms";
import { cn } from "@/shared/lib/utils";
import type { TAdminArticleCrop } from "../types/article-admin.types";

export type TAdminCropSelectProps = {
  crops: TAdminArticleCrop[];
  /** `slug` của cây đang chọn. */
  value: string | undefined;
  onValueChange: (cropSlug: string) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
};

/** Chọn cây — mỗi cây kèm "số bài / số bệnh" để thấy ngay cây nào còn bệnh chưa có bài. */
export function AdminCropSelect({ crops, value, onValueChange, disabled, id, className }: TAdminCropSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger id={id} className={cn("w-full sm:w-72", className)} aria-label="Cây trồng">
        <SelectValue placeholder="Chọn cây trồng" />
      </SelectTrigger>
      <SelectContent position="popper" className="max-h-72">
        {crops.map((crop) => (
          <SelectItem key={crop.slug} value={crop.slug}>
            <span className="flex w-full items-center justify-between gap-3">
              <span className="truncate">{crop.nameVi}</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {crop.articleCount}/{crop.targetCount} bài
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
