"use client";

import { CircleCheckIcon, FileIcon, UploadIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { useImagePreview } from "@/shared/hooks";
import { cn } from "@/shared/lib/utils";
import type { TFileUpload } from "@/shared/types";
import { Button } from "../atoms";

export type TFileInputFieldProps = Omit<React.ComponentProps<"div">, "onChange" | "onSelect" | "defaultValue"> & {
  /** id của nút chọn — label của FormField trỏ tới. */
  id?: string;
  /** File đã chọn — upload ngay khi chọn (bên gọi chạy upload, molecule chỉ hiển thị trạng thái). */
  value: TFileUpload | null;
  /** Người dùng chọn file mới. */
  onSelect: (file: File) => void;
  /** Bỏ file đang chọn (đang tải thì bên gọi huỷ upload). */
  onRemove: () => void;
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

/** Thanh tiến trình + % khi đang tải, dấu "Đã tải lên" khi xong. */
function UploadStatus({ upload }: { upload: TFileUpload }) {
  if (upload.status === "done") {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <CircleCheckIcon className="size-3.5 text-highlight" aria-hidden />
        Đã tải lên
      </span>
    );
  }
  return (
    <span className="flex items-center gap-2 text-xs text-muted-foreground">
      <span
        role="progressbar"
        aria-label={`Đang tải ${upload.file.name}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={upload.progress}
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
      >
        <span
          className="block h-full rounded-full bg-highlight transition-[width] duration-200"
          style={{ width: `${upload.progress}%` }}
        />
      </span>
      <span className="w-9 shrink-0 text-right tabular-nums">{upload.progress}%</span>
    </span>
  );
}

/**
 * Chọn 1 file (upload ngay khi chọn) — nút chọn + tên file + ảnh xem trước (nếu là ảnh) + tiến trình + nút bỏ chọn.
 * Input file thật bị ẩn; nút chọn nhận focus, label và aria của field.
 */
export function FileInputField({
  id,
  value,
  onSelect,
  onRemove,
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
  const file = value?.file ?? null;
  const previewUrl = useImagePreview(file);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0];
    // Reset để chọn lại cùng file vẫn bắn change.
    event.target.value = "";
    if (picked) onSelect(picked);
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

      {file && previewUrl ? (
        <Image
          src={previewUrl}
          alt={`Xem trước ${file.name}`}
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

      <div className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
        {value ? (
          <>
            <span className="block truncate font-medium" title={value.file.name}>
              {value.file.name}
            </span>
            <UploadStatus upload={value} />
          </>
        ) : (
          <span className="block truncate text-muted-foreground">{placeholder}</span>
        )}
      </div>

      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          disabled={disabled}
          aria-label={value.status === "uploading" ? `Huỷ tải ${value.file.name}` : `Bỏ chọn ${value.file.name}`}
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
