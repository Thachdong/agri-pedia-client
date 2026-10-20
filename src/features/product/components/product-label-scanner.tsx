"use client";

import { Loader2Icon, ScanTextIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/atoms";
import { AddImageTile, Callout } from "@/shared/components/molecules";
import { CameraCaptureDialog } from "@/shared/components/organisms";
import { useImagePreview } from "@/shared/hooks";
import { isAppError } from "@/shared/lib/http";
import { compressImage, ImageDecodeError } from "@/shared/lib/image";
import { cn } from "@/shared/lib/utils";
import {
  PRODUCT_ERROR_CODE,
  PRODUCT_ERROR_MESSAGES,
  SUGGESTION_PHOTO_ACCEPT,
  SUGGESTION_PHOTO_MAX_BYTES,
  SUGGESTION_PHOTO_MAX_EDGE,
} from "../constants/product.constants";
import { useSuggestProduct } from "../hooks/use-suggest-product";
import type { TProductSuggestion } from "../types/product.types";

export type TProductSuggestionContent = NonNullable<TProductSuggestion["suggestion"]>;

export type TProductLabelScannerProps = {
  /** Tìm thấy trong danh mục → bên gọi điền tên + mô tả (tự hỏi trước khi ghi đè). */
  onFound: (suggestion: TProductSuggestionContent) => void;
  /** Đọc được tên nhưng chưa có trong danh mục → người dùng chọn "Dùng tên này". */
  onUseName: (name: string) => void;
  disabled?: boolean;
  className?: string;
};

const FALLBACK_ERROR = "Không gợi ý được, vui lòng thử lại";

/**
 * Điền nhanh từ ảnh nhãn (distributor-flow.png "Product Creation Support"): chụp (camera trong trang) / chọn ảnh nhãn
 * → nén JPEG ≤ 5 MB → POST /products/suggestions → tìm thấy: điền tên + mô tả; chưa có trong danh mục: gợi ý dùng tên
 * đọc được; không đọc được: chụp lại. Lượt gợi ý tính trọn đời — chỉ biết số còn lại sau lần quét đầu.
 */
export function ProductLabelScanner({ onFound, onUseName, disabled = false, className }: TProductLabelScannerProps) {
  const suggest = useSuggestProduct();
  const [cameraOpen, setCameraOpen] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState<string>();
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const preview = useImagePreview(photo);

  const result = suggest.data;
  const busy = compressing || suggest.isPending;

  const scan = async (file: File) => {
    setPhoto(file);
    setError(undefined);
    suggest.reset();
    let image: Blob;
    setCompressing(true);
    try {
      image = await compressImage(file, {
        maxBytes: SUGGESTION_PHOTO_MAX_BYTES,
        maxWidth: SUGGESTION_PHOTO_MAX_EDGE,
        maxHeight: SUGGESTION_PHOTO_MAX_EDGE,
      });
    } catch (cause) {
      setError(cause instanceof ImageDecodeError ? cause.message : FALLBACK_ERROR);
      return;
    } finally {
      setCompressing(false);
    }
    try {
      const response = await suggest.mutateAsync(image);
      if (response.status === "FOUND" && response.suggestion) onFound(response.suggestion);
    } catch (cause) {
      if (isAppError(cause) && cause.code === PRODUCT_ERROR_CODE.SUGGESTION_QUOTA_EXCEEDED) setQuotaExceeded(true);
      setError(isAppError(cause) ? (PRODUCT_ERROR_MESSAGES[cause.code] ?? cause.message) : FALLBACK_ERROR);
    }
  };

  return (
    <section
      aria-labelledby="product-label-scanner-title"
      className={cn("flex flex-col gap-3 rounded-lg border border-dashed border-input p-3", className)}
    >
      <header className="flex flex-col gap-0.5">
        <h3 id="product-label-scanner-title" className="flex items-center gap-2 text-sm font-semibold">
          <ScanTextIcon className="size-4 text-primary" aria-hidden />
          Điền nhanh từ ảnh nhãn
        </h3>
        <p className="text-xs text-muted-foreground">
          Chụp rõ tên sản phẩm trên nhãn — hệ thống gợi ý tên và mô tả. Ảnh nhãn không được lưu.
        </p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URL xem trước, không qua next/image
          <img src={preview} alt="Ảnh nhãn vừa quét" className="h-28 w-full rounded-md object-cover sm:w-28" />
        ) : null}
        <AddImageTile
          remaining={1}
          multiple={false}
          accept={SUGGESTION_PHOTO_ACCEPT}
          onCapture={() => setCameraOpen(true)}
          onPick={([file]) => file && void scan(file)}
          disabled={disabled || busy || quotaExceeded}
          className="aspect-auto h-28 w-full sm:w-36"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-2" aria-live="polite">
          {busy && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" aria-hidden />
              {compressing ? "Đang chuẩn bị ảnh…" : "Đang đọc nhãn…"}
            </p>
          )}
          {!busy && error && (
            <Callout tone={quotaExceeded ? "warning" : "danger"} role="alert">
              {error}
            </Callout>
          )}
          {!busy && !error && result && <ResultMessage result={result} onUseName={onUseName} />}
          {!busy && !error && !result && (
            <p className="text-sm text-muted-foreground">Chụp hoặc chọn 1 ảnh nhãn để bắt đầu.</p>
          )}
          {result && !quotaExceeded && (
            <p className="text-xs text-muted-foreground">Còn {result.remaining} lượt gợi ý.</p>
          )}
        </div>
      </div>

      <CameraCaptureDialog
        open={cameraOpen}
        onOpenChange={setCameraOpen}
        title="Chụp nhãn sản phẩm"
        description="Đưa tên sản phẩm trên nhãn vào giữa khung hình"
        remaining={1}
        onCapture={(file) => void scan(file)}
      />
    </section>
  );
}

function ResultMessage({ result, onUseName }: { result: TProductSuggestion; onUseName: (name: string) => void }) {
  if (result.status === "FOUND" && result.suggestion) {
    return (
      <Callout tone="success">
        Tìm thấy <span className="font-semibold">{result.suggestion.name}</span> — đã gợi ý tên và mô tả, hãy kiểm tra lại.
      </Callout>
    );
  }
  if (result.status === "NOT_FOUND" && result.detectedName) {
    const name = result.detectedName;
    return (
      <Callout
        tone="info"
        action={
          <Button type="button" size="sm" variant="outline" onClick={() => onUseName(name)}>
            Dùng tên này
          </Button>
        }
      >
        Đọc được <span className="font-semibold">“{name}”</span> nhưng chưa có trong danh mục gợi ý.
      </Callout>
    );
  }
  return <Callout tone="warning">Không đọc được tên sản phẩm. Hãy chụp lại rõ phần tên trên nhãn.</Callout>;
}
