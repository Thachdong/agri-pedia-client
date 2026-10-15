"use client";

import { ImageOffIcon, Maximize2Icon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Badge, type TBadgeTone } from "@/shared/components/atoms";
import { Callout } from "@/shared/components/molecules";
import { cn } from "@/shared/lib/utils";
import { IMAGE_STATUS_LABELS } from "../constants/diagnosis.constants";
import { useCropLabels } from "../hooks/use-crop-labels";
import type { TDiagnosisImage, TDiagnosisImageStatus } from "../types/diagnosis.types";
import { resultImageAnchorId } from "../utils/diagnosis-view.util";
import { DiagnosisResultTable } from "./diagnosis-result-table";
import { ImageLightbox } from "./image-lightbox";
import { RegionOverlay } from "./region-overlay";

const IMAGE_STATUS_TONES: Record<TDiagnosisImageStatus, TBadgeTone> = {
  DISEASED: "highlight",
  HEALTHY: "success",
  UNCERTAIN: "neutral",
  NOT_TARGET_CROP: "warning",
  LOW_QUALITY: "warning",
};

export type TDiagnosisResultImageProps = {
  image: TDiagnosisImage;
  /** Cây của lần chẩn đoán — nhãn bộ phận theo cây. */
  cropType: string;
  /** Bấm tên bệnh → mở báo cáo bệnh. */
  onOpenDisease: (code: string) => void;
  className?: string;
};

/**
 * Kết quả 1 ảnh: ảnh + khung vùng bệnh (bấm → lightbox) và bảng bệnh; ảnh không có bệnh → `message` của server.
 * lg: 2 cột [ảnh | bảng]; mobile: xếp dọc. Hover / chạm hàng bảng ↔ làm nổi khung tương ứng.
 */
export function DiagnosisResultImage({ image, cropType, onOpenDisease, className }: TDiagnosisResultImageProps) {
  const { partLabel } = useCropLabels(cropType);
  // undefined = không làm nổi; null = vùng chưa xác định.
  const [highlightedCode, setHighlightedCode] = useState<string | null | undefined>(undefined);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const title = `Ảnh ${image.index + 1} · ${partLabel(image.plantPart)}`;
  const showTable = image.status === "DISEASED" && image.diseases.length > 0;

  return (
    <article
      // Đích cuộn từ bảng tổng hợp — scroll-mt chừa chỗ cho header dính.
      id={resultImageAnchorId(image.index)}
      tabIndex={-1}
      className={cn("card-normal flex scroll-mt-20 flex-col gap-4 rounded-xl p-4 outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5", className)}
      aria-label={title}
    >
      <header className="flex flex-wrap items-center gap-2">
        <h3 className="font-semibold">{title}</h3>
        {image.status && <Badge tone={IMAGE_STATUS_TONES[image.status]}>{IMAGE_STATUS_LABELS[image.status]}</Badge>}
        {image.detectedPart && image.detectedPart !== image.plantPart && (
          <p className="w-full text-xs text-muted-foreground">
            AI nhận diện đây là {partLabel(image.detectedPart).toLowerCase()}
          </p>
        )}
      </header>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        {image.url ? (
          <div className="flex justify-center rounded-lg bg-muted">
            <div className="relative inline-block">
              <Image
                src={image.url}
                alt={title}
                width={0}
                height={0}
                sizes="(min-width: 1024px) 28rem, 100vw"
                unoptimized
                className="block h-auto max-h-[28rem] w-auto max-w-full rounded-lg"
              />
              <RegionOverlay
                regions={image.regions}
                highlightedCode={highlightedCode}
                onHighlightCode={setHighlightedCode}
              />
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                aria-label={`Phóng to ${title.toLowerCase()}`}
                className="absolute right-2 bottom-2 flex size-8 items-center justify-center rounded-full bg-background/85 shadow-sm outline-none hover:bg-background focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Maximize2Icon className="size-4" aria-hidden />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-lg bg-muted text-sm text-muted-foreground">
            <ImageOffIcon className="size-8" aria-hidden />
            Không tải được ảnh
          </div>
        )}

        {showTable ? (
          <DiagnosisResultTable
            image={image}
            highlightedCode={highlightedCode}
            onHighlightCode={setHighlightedCode}
            onOpenDisease={onOpenDisease}
            partLabel={partLabel}
          />
        ) : (
          image.message && <Callout tone={image.status === "HEALTHY" ? "success" : "neutral"}>{image.message}</Callout>
        )}
      </div>

      {image.url && (
        <ImageLightbox
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          url={image.url}
          title={title}
          regions={image.regions}
        />
      )}
    </article>
  );
}
