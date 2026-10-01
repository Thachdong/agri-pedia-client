"use client";

import { ImagePlusIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/utils";
import { Button } from "../atoms";

/** Ảnh đã có trên server (vd. media của product) — `url` là signed URL. */
export type TExistingImage = { id: string; url: string };

export type TMultiImageInputProps = Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> & {
  /** id của ô "Thêm ảnh" — label của FormField trỏ tới. */
  id?: string;
  /** Ảnh mới chọn (chưa upload). */
  value: File[];
  onChange: (files: File[]) => void;
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

/**
 * Data URL để xem trước các file mới. Đọc bất đồng bộ; kết quả gắn với đúng mảng file đã đọc
 * nên đổi danh sách thì preview cũ tự bỏ, không cần reset state.
 */
function useImagePreviews(files: File[]) {
  const [previews, setPreviews] = useState<{ files: File[]; urls: Map<File, string> } | null>(null);
  useEffect(() => {
    const readers = files.map((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== "string") return;
        const url = reader.result;
        setPreviews((current) => {
          const urls = new Map(current?.files === files ? current.urls : undefined);
          urls.set(file, url);
          return { files, urls };
        });
      };
      reader.readAsDataURL(file);
      return reader;
    });
    return () => readers.forEach((reader) => reader.abort());
  }, [files]);
  return previews?.files === files ? previews.urls : null;
}

const TILE = "relative aspect-square overflow-hidden rounded-lg border border-border-subtle bg-muted";

/**
 * Chọn nhiều ảnh: lưới ảnh cũ (xoá được) + ảnh mới (bỏ chọn được) + ô "Thêm ảnh" (chọn nhiều file một lần).
 * Đủ `max` ảnh thì ẩn ô thêm. Input file thật bị ẩn; ô thêm nhận focus, label và aria của field.
 */
export function MultiImageInput({
  id,
  value,
  onChange,
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
  const previews = useImagePreviews(value);
  const total = existing.length + value.length;
  const remaining = Math.max(max - total, 0);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []).slice(0, remaining);
    // Reset để chọn lại cùng file vẫn bắn change.
    event.target.value = "";
    if (picked.length > 0) onChange([...value, ...picked]);
  };

  const removeButton = (label: string, onClick: () => void) => (
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
            {onRemoveExisting && removeButton(`Xoá ảnh ${index + 1}`, () => onRemoveExisting(image.id))}
          </li>
        ))}
        {value.map((file, index) => {
          const preview = previews?.get(file);
          return (
            <li key={`${file.name}-${file.lastModified}-${index}`} className={TILE}>
              {preview && (
                <Image src={preview} alt={`Xem trước ${file.name}`} fill sizes="128px" unoptimized className="object-cover" />
              )}
              {removeButton(`Bỏ chọn ${file.name}`, () => onChange(value.filter((_, position) => position !== index)))}
            </li>
          );
        })}
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
