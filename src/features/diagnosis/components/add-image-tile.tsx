"use client";

import { CameraIcon, ImagePlusIcon } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/shared/lib/utils";
import { DIAGNOSIS_IMAGE_ACCEPT } from "../constants/diagnosis.constants";

export type TAddImageTileProps = {
  /** Số ảnh còn được thêm — file chọn dư bị cắt bớt. */
  remaining: number;
  /** Mở camera trong trang (dialog). */
  onCapture: () => void;
  onPick: (files: File[]) => void;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
};

const ACTION =
  "flex flex-1 flex-col items-center justify-center gap-1 px-2 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-highlight-subtle hover:text-highlight focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset disabled:cursor-not-allowed disabled:opacity-50";

/** Ô thêm ảnh trong lưới: nửa trên "Chụp ảnh" (camera), nửa dưới "Chọn từ máy" (input file, chọn nhiều). */
export function AddImageTile({ remaining, onCapture, onPick, disabled = false, invalid, className }: TAddImageTileProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []).slice(0, remaining);
    // Reset để chọn lại cùng file vẫn bắn change.
    event.target.value = "";
    if (picked.length > 0) onPick(picked);
  };

  return (
    <div
      className={cn(
        "flex aspect-square flex-col divide-y divide-dashed divide-input overflow-hidden rounded-lg border-2 border-dashed border-input",
        invalid && "border-destructive",
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={DIAGNOSIS_IMAGE_ACCEPT}
        multiple
        disabled={disabled}
        onChange={handleChange}
        tabIndex={-1}
        aria-hidden
        className="sr-only"
      />
      <button type="button" onClick={onCapture} disabled={disabled} className={ACTION}>
        <CameraIcon className="size-5" aria-hidden />
        Chụp ảnh
      </button>
      <button type="button" onClick={() => inputRef.current?.click()} disabled={disabled} className={ACTION}>
        <ImagePlusIcon className="size-5" aria-hidden />
        Chọn từ máy
      </button>
    </div>
  );
}
