"use client";

import { FileIcon, UploadIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/utils";
import { Button } from "../atoms";

export type TFileInputFieldProps = Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> & {
  /** id của nút chọn — label của FormField trỏ tới. */
  id?: string;
  value: File | null;
  onChange: (file: File | null) => void;
  onBlur?: () => void;
  /** Thuộc tính `accept` của input file (vd. ".jpg,.png,image/*"). */
  accept?: string;
  disabled?: boolean;
  /** Nội dung khi chưa chọn file mới (vd. file hiện tại / "Chưa có file"). */
  placeholder?: React.ReactNode;
  /** Nhãn nút chọn. */
  buttonLabel?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

const PREVIEW_SIZE = 48;

/**
 * Data URL để xem trước ảnh đã chọn. Đọc bất đồng bộ; kết quả gắn với đúng file đã đọc
 * nên đổi / bỏ file thì preview cũ tự mất, không cần reset state.
 */
function useImagePreview(file: File | null) {
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null);
  useEffect(() => {
    if (!file?.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setPreview({ file, url: reader.result });
    };
    reader.readAsDataURL(file);
    return () => reader.abort();
  }, [file]);
  return preview && preview.file === file ? preview.url : null;
}

/**
 * Chọn 1 file (chưa upload) — nút chọn + tên file + ảnh xem trước (nếu là ảnh) + nút bỏ chọn.
 * Input file thật bị ẩn; nút chọn nhận focus, label và aria của field.
 */
export function FileInputField({
  id,
  value,
  onChange,
  onBlur,
  accept,
  disabled = false,
  placeholder = "Chưa chọn file",
  buttonLabel = "Chọn file",
  className,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  ...props
}: TFileInputFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = useImagePreview(value);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    // Reset để chọn lại cùng file vẫn bắn change.
    event.target.value = "";
    if (file) onChange(file);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-input p-2",
        ariaInvalid && "border-destructive",
        className,
      )}
      {...props}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={handleChange}
        tabIndex={-1}
        aria-hidden
        className="sr-only"
      />

      {value && previewUrl ? (
        <Image
          src={previewUrl}
          alt={`Xem trước ${value.name}`}
          width={PREVIEW_SIZE}
          height={PREVIEW_SIZE}
          unoptimized
          className="size-12 shrink-0 rounded-md object-cover"
        />
      ) : (
        <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <FileIcon className="size-5" aria-hidden />
        </span>
      )}

      <div className="min-w-0 flex-1 text-sm">
        {value ? (
          <span className="block truncate font-medium" title={value.name}>
            {value.name}
          </span>
        ) : (
          <span className="block truncate text-muted-foreground">{placeholder}</span>
        )}
      </div>

      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onChange(null)}
          disabled={disabled}
          aria-label={`Bỏ chọn ${value.name}`}
          className="text-muted-foreground hover:text-foreground"
        >
          <XIcon aria-hidden />
        </Button>
      )}

      <Button
        id={id}
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        onBlur={onBlur}
        disabled={disabled}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
      >
        <UploadIcon aria-hidden />
        {buttonLabel}
      </Button>
    </div>
  );
}
