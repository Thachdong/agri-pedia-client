"use client";

import { CircleCheckIcon, ImageOffIcon, SearchXIcon, StethoscopeIcon } from "lucide-react";
import Image from "next/image";
import { Callout } from "@/shared/components/molecules";
import { cn } from "@/shared/lib/utils";
import { IMAGE_STATUS_LABELS } from "../constants/diagnosis.constants";
import { type TCropLabels, useCropLabels } from "../hooks/use-crop-labels";
import type { TDiagnosis, TDiagnosisImage } from "../types/diagnosis.types";
import {
  formatLocation,
  imagePartLabel,
  regionsOfDisease,
  resultImageAnchorId,
  uniqueSymptoms,
} from "../utils/diagnosis-view.util";
import { ConfidenceBadge } from "./confidence-badge";
import { DiseaseNameButton } from "./disease-name-button";

export type TDiagnosisSummaryProps = {
  diagnosis: Pick<TDiagnosis, "summary" | "images" | "cropType">;
  /** Bấm tên bệnh → mở báo cáo bệnh. */
  onOpenDisease: (code: string) => void;
  className?: string;
};

const CELL = "px-3 py-3 align-top";
/** Hàng của các cột gạch đầu dòng theo bệnh — cùng chiều cao tối thiểu để thẳng hàng giữa các cột. */
const DISEASE_ITEM = "flex min-h-7 items-start";

/** Cuộn tới ảnh trong "Kết quả từng ảnh" và đưa focus vào đó (bàn phím / screen reader). */
const scrollToImage = (index: number) => {
  const target = document.getElementById(resultImageAnchorId(index));
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  target.focus({ preventScroll: true });
};

/**
 * Tổng hợp kết quả: kết luận chung + bảng mỗi ảnh 1 hàng — ảnh (bấm → cuộn tới ảnh), bệnh phát hiện (link báo cáo),
 * độ tin cậy, vị trí (theo từng bệnh), triệu chứng. Bảng cuộn ngang trên màn hình hẹp.
 */
export function DiagnosisSummary({ diagnosis, onOpenDisease, className }: TDiagnosisSummaryProps) {
  const { partLabel } = useCropLabels(diagnosis.cropType);
  const images = [...diagnosis.images].sort((a, b) => a.index - b.index);

  return (
    <section aria-labelledby="diagnosis-summary-title" className={cn("card-normal flex flex-col gap-4 rounded-xl p-4 sm:p-5", className)}>
      <Conclusion diagnosis={diagnosis} />
      {diagnosis.summary?.conflict && <Callout tone="warning">Các ảnh cho kết quả khác nhau, nên kiểm tra thêm.</Callout>}

      <div className="scrollbar-thin overflow-x-auto rounded-lg border border-border-subtle bg-background">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <caption className="sr-only">Kết quả theo từng ảnh</caption>
          <thead className="table-header">
            <tr>
              <th scope="col" className="w-24 px-3 py-2 font-medium">Ảnh</th>
              <th scope="col" className="px-3 py-2 font-medium">Phát hiện bệnh</th>
              <th scope="col" className="w-36 px-3 py-2 font-medium">Độ tin cậy</th>
              <th scope="col" className="w-40 px-3 py-2 font-medium">Vị trí</th>
              <th scope="col" className="px-3 py-2 font-medium">Triệu chứng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {images.map((image) => (
              <ImageRow key={image.index} image={image} onOpenDisease={onOpenDisease} partLabel={partLabel} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Conclusion({ diagnosis }: { diagnosis: Pick<TDiagnosis, "summary" | "images"> }) {
  const { summary, images } = diagnosis;
  const allHealthy = images.length > 0 && images.every((image) => image.status === "HEALTHY");

  if (summary?.hasDisease) {
    return (
      <h2 id="diagnosis-summary-title" className="flex items-center gap-2 text-lg font-semibold">
        <StethoscopeIcon className="size-5 text-highlight" aria-hidden />
        Phát hiện {summary.diseases.length} bệnh có thể có
      </h2>
    );
  }
  if (allHealthy) {
    return (
      <h2 id="diagnosis-summary-title" className="flex items-center gap-2 text-lg font-semibold">
        <CircleCheckIcon className="size-5 text-success" aria-hidden />
        Không phát hiện dấu hiệu bệnh
      </h2>
    );
  }
  return (
    <div className="flex flex-col gap-1">
      <h2 id="diagnosis-summary-title" className="flex items-center gap-2 text-lg font-semibold">
        <SearchXIcon className="size-5 text-muted-foreground" aria-hidden />
        Chưa xác định được bệnh
      </h2>
      <p className="text-sm text-muted-foreground">Vui lòng thử ảnh khác (chụp gần, rõ vết bệnh).</p>
    </div>
  );
}

type TImageRowProps = {
  image: TDiagnosisImage;
  onOpenDisease: (code: string) => void;
  partLabel: TCropLabels["partLabel"];
};

function ImageRow({ image, onOpenDisease, partLabel }: TImageRowProps) {
  const label = `Ảnh ${image.index + 1}`;
  const diseases = image.diseases;
  const symptoms = uniqueSymptoms(image.regions);
  const noDiseaseText = image.message ?? (image.status ? IMAGE_STATUS_LABELS[image.status] : "Không phát hiện bệnh");

  return (
    <tr className="bg-background">
      <td className={CELL}>
        <button
          type="button"
          onClick={() => scrollToImage(image.index)}
          aria-label={`Xem ${label.toLowerCase()} trong kết quả từng ảnh`}
          className="group flex flex-col items-center gap-1 rounded-md text-xs text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="relative size-16 overflow-hidden rounded-md border border-border-subtle bg-muted transition-shadow group-hover:ring-2 group-hover:ring-highlight">
            {image.url ? (
              <Image src={image.url} alt="" fill sizes="64px" unoptimized className="object-cover" />
            ) : (
              <span className="flex size-full items-center justify-center">
                <ImageOffIcon className="size-5" aria-hidden />
              </span>
            )}
          </span>
          {label} · {imagePartLabel(image, partLabel)}
        </button>
      </td>
      {diseases.length > 0 ? (
        <>
          <td className={CELL}>
            <ul className="list-disc space-y-1 pl-4 marker:text-muted-foreground">
              {diseases.map((disease) => (
                <li key={`${disease.diseaseCode}-${disease.variantCode ?? ""}`} className="min-h-7">
                  <DiseaseNameButton
                    name={disease.diseaseName}
                    variantName={disease.variantName}
                    onClick={() => onOpenDisease(disease.diseaseCode)}
                    className="align-top"
                  />
                </li>
              ))}
            </ul>
          </td>
          <td className={CELL}>
            <ul className="space-y-1">
              {diseases.map((disease) => (
                <li key={`${disease.diseaseCode}-${disease.variantCode ?? ""}`} className={DISEASE_ITEM}>
                  <ConfidenceBadge level={disease.confidence.level} />
                </li>
              ))}
            </ul>
          </td>
          <td className={CELL}>
            <ul className="space-y-1">
              {diseases.map((disease) => (
                <li key={`${disease.diseaseCode}-${disease.variantCode ?? ""}`} className={DISEASE_ITEM}>
                  {formatLocation(image, regionsOfDisease(image, disease.diseaseCode).length, partLabel)}
                </li>
              ))}
            </ul>
          </td>
        </>
      ) : (
        <td colSpan={3} className={cn(CELL, "text-muted-foreground")}>
          {noDiseaseText}
        </td>
      )}
      <td className={CELL}>
        {symptoms.length > 0 ? (
          <ul className="list-disc space-y-1 pl-4 marker:text-muted-foreground">
            {symptoms.map((symptom) => (
              <li key={symptom}>{symptom}</li>
            ))}
          </ul>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
    </tr>
  );
}
