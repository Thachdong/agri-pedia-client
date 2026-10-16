"use client";

import { ImageIcon, TriangleAlertIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/shared/components/atoms";
import { useImagePreview } from "@/shared/hooks";
import { cn } from "@/shared/lib/utils";
import type { TPlantPart } from "../types/diagnosis.types";
import type { TCropPlantPart } from "../types/knowledge.types";
import { PlantPartSelect } from "./plant-part-select";

export type TDiagnosisImageSlotProps = {
  /** Thứ tự 0-based (hiển thị "Ảnh 1"...). */
  index: number;
  file: File;
  plantPart: TPlantPart | "";
  /** Bộ phận chọn được của cây. */
  plantPartOptions: TCropPlantPart[];
  onPlantPartChange: (value: TPlantPart) => void;
  onRemove: () => void;
  /** Ảnh có thể bị mờ — chỉ cảnh báo, không chặn gửi. */
  blurry?: boolean;
  /** Lỗi của ảnh (định dạng không hỗ trợ, server từ chối...). */
  error?: string;
  /** Lỗi chưa chọn bộ phận (từ schema). */
  plantPartError?: string;
  disabled?: boolean;
  className?: string;
};

/** 1 ô ảnh của form chẩn đoán: thumbnail + nút xoá + cảnh báo mờ / lỗi + chọn bộ phận. */
export function DiagnosisImageSlot({
  index,
  file,
  plantPart,
  plantPartOptions,
  onPlantPartChange,
  onRemove,
  blurry = false,
  error,
  plantPartError,
  disabled = false,
  className,
}: TDiagnosisImageSlotProps) {
  const preview = useImagePreview(file);
  const label = `Ảnh ${index + 1}`;
  const selectId = `diagnosis-image-${index}-part`;
  const messageId = `diagnosis-image-${index}-message`;
  const message = error ?? plantPartError;

  return (
    <li className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <div
        className={cn(
          "relative aspect-square overflow-hidden rounded-lg border border-border-subtle bg-muted",
          error && "border-2 border-destructive",
        )}
      >
        {preview ? (
          <Image src={preview} alt={label} fill sizes="(min-width: 1024px) 12rem, 50vw" unoptimized className="object-cover" />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-1 p-2 text-center text-xs text-muted-foreground">
            <ImageIcon className="size-6" aria-hidden />
            <span className="line-clamp-2 break-all">{file.name}</span>
          </div>
        )}
        <span className="absolute top-1.5 left-1.5 rounded-md bg-background/85 px-1.5 py-0.5 text-xs font-medium">
          {label}
        </span>
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          onClick={onRemove}
          disabled={disabled}
          aria-label={`Xoá ${label.toLowerCase()}`}
          className="absolute top-1 right-1 rounded-full shadow-sm"
        >
          <XIcon aria-hidden />
        </Button>
        {blurry && !error && (
          <span className="absolute inset-x-1.5 bottom-1.5 flex items-center gap-1 rounded-md bg-warning-subtle px-1.5 py-1 text-xs leading-tight font-medium text-warning">
            <TriangleAlertIcon className="size-3.5 shrink-0" aria-hidden />
            Ảnh có thể bị mờ, nên chụp lại
          </span>
        )}
      </div>
      <PlantPartSelect
        id={selectId}
        value={plantPart}
        options={plantPartOptions}
        onValueChange={onPlantPartChange}
        disabled={disabled}
        aria-label={`Bộ phận của ${label.toLowerCase()}`}
        aria-invalid={message ? true : undefined}
        aria-describedby={message ? messageId : undefined}
      />
      {message && (
        <p id={messageId} role="alert" className="text-xs text-destructive">
          {message}
        </p>
      )}
    </li>
  );
}
