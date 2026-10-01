"use client";

import { ImagePlusIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { useImagePreview } from "@/shared/hooks";
import { cn } from "@/shared/lib/utils";
import type { TFileUpload } from "@/shared/types";
import { Button } from "../atoms";

/** Ảnh đã có trên server (vd. media của product) — `url` là signed URL. */
export type TExistingImage = { id: string; url: string };

export type TMultiImageInputProps = Omit<React.ComponentProps<"div">, "onChange" | "onSelect" | "defaultValue"> & {
  /** id của ô "Thêm ảnh" — label của FormField trỏ tới. */
  id?: string;
  /** Ảnh mới chọn — upload ngay khi chọn (bên gọi chạy upload, molecule chỉ hiển thị trạng thái). */
  value: TFileUpload[];
  /** Ảnh vừa chọn (đã cắt theo số chỗ còn lại). */
  onSelect: (files: File[]) => void;
  /** Bỏ 1 ảnh mới (đang tải thì bên gọi huỷ upload). */
  onRemove: (id: string) => void;
  onBlur?: () => void;
  /** Ảnh cũ còn giữ (bên gọi tự bỏ những ảnh đã đánh dấu xoá). */
  existing?: TExistingImage[];
  onRemoveExisting?: (id: string) => void;
  /** Tổng số ảnh tối đa (cũ + mới) — chọn quá thì cắt bớt. */
  max: number;
  /** Thuộc tính `accept` của input file. */
  accept?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

const TILE = "relative aspect-square overflow-hidden rounded-lg border border-border-subtle bg-muted";

type TRemoveButtonProps = { label: string; onClick: () => void; disabled: boolean };

function RemoveButton({ label, onClick, disabled }: TRemoveButtonProps) {
  return (
    <Button
      type="button"
      variant="secondary"
      size="icon-sm"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="absolute top-1 right-1 rounded-full shadow-sm"
    >
      <XIcon aria-hidden />
    </Button>
  );
}

type TUploadTileProps = { upload: TFileUpload; onRemove: () => void; disabled: boolean };

/** Tile ảnh mới: xem trước + lớp phủ % khi đang tải. Preview đọc theo `file` nên tiến trình đổi không đọc lại ảnh. */
function UploadTile({ upload, onRemove, disabled }: TUploadTileProps) {
  const preview = useImagePreview(upload.file);
  const uploading = upload.status === "uploading";

  return (
    <li className={TILE} aria-busy={uploading}>
      {preview && (
        <Image src={preview} alt={`Xem trước ${upload.file.name}`} fill sizes="128px" unoptimized className="object-cover" />
      )}
      {uploading && (
        <div className="absolute inset-0 flex flex-col items-center justify-end gap-1 bg-background/70 p-2">
          <span className="text-xs font-medium tabular-nums">{upload.progress}%</span>
          <span
            role="progressbar"
            aria-label={`Đang tải ${upload.file.name}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={upload.progress}
            className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
          >
            <span
              className="block h-full rounded-full bg-highlight transition-[width] duration-200"
              style={{ width: `${upload.progress}%` }}
            />
          </span>
        </div>
      )}
      <RemoveButton
        label={uploading ? `Huỷ tải ${upload.file.name}` : `Bỏ chọn ${upload.file.name}`}
        onClick={onRemove}
        disabled={disabled}
      />
    </li>
  );
}

/**
 * Chọn nhiều ảnh (upload ngay khi chọn): lưới ảnh cũ (xoá được) + ảnh mới (tiến trình, bỏ chọn được) + ô "Thêm ảnh".
 * Đủ `max` ảnh thì ẩn ô thêm. Input file thật bị ẩn; ô thêm nhận focus, label và aria của field.
 */
export function MultiImageInput({
  id,
  value,
  onSelect,
  onRemove,
  onBlur,
  existing = [],
  onRemoveExisting,
  max,
  accept = "image/*",
  disabled = false,
  className,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  ...props
}: TMultiImageInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const total = existing.length + value.length;
  const remaining = Math.max(max - total, 0);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []).slice(0, remaining);
    // Reset để chọn lại cùng file vẫn bắn change.
    event.target.value = "";
    if (picked.length > 0) onSelect(picked);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        disabled={disabled}
        onChange={handleChange}
        tabIndex={-1}
        aria-hidden
        className="sr-only"
      />

      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {existing.map((image, index) => (
          <li key={image.id} className={TILE}>
            <Image src={image.url} alt={`Ảnh ${index + 1}`} fill sizes="128px" unoptimized className="object-cover" />
            {onRemoveExisting && (
              <RemoveButton
                label={`Xoá ảnh ${index + 1}`}
                onClick={() => onRemoveExisting(image.id)}
                disabled={disabled}
              />
            )}
          </li>
        ))}
        {value.map((upload) => (
          <UploadTile key={upload.id} upload={upload} onRemove={() => onRemove(upload.id)} disabled={disabled} />
        ))}
        {remaining > 0 && (
          <li>
            <button
              id={id}
              type="button"
              onClick={() => inputRef.current?.click()}
              onBlur={onBlur}
              disabled={disabled}
              aria-describedby={ariaDescribedBy}
              className={cn(
                "flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-input text-xs text-muted-foreground outline-none transition-colors",
                "hover:border-highlight hover:text-highlight focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:cursor-not-allowed disabled:opacity-50",
                ariaInvalid && "border-destructive",
              )}
            >
              <ImagePlusIcon className="size-5" aria-hidden />
              Thêm ảnh
            </button>
          </li>
        )}
      </ul>

      <p className="text-xs text-muted-foreground">
        {total}/{max} ảnh
      </p>
    </div>
  );
}
