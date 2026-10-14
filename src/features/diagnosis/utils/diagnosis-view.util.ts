import { PLANT_PART_LABELS } from "../constants/diagnosis.constants";
import type { TDiagnosisImage, TDiagnosisRegion } from "../types/diagnosis.types";

/** Vùng của 1 bệnh trên ảnh (theo diseaseCode). */
export const regionsOfDisease = (image: Pick<TDiagnosisImage, "regions">, diseaseCode: string) =>
  image.regions.filter((region) => region.diagnosis?.diseaseCode === diseaseCode);

/** Triệu chứng không trùng, giữ thứ tự xuất hiện. */
export const uniqueSymptoms = (regions: TDiagnosisRegion[]) => [...new Set(regions.map((region) => region.symptom))];

/** Bộ phận của ảnh — ưu tiên bộ phận AI nhận diện, không có thì bộ phận người dùng chọn. */
export const imagePartLabel = ({ plantPart, detectedPart }: Pick<TDiagnosisImage, "plantPart" | "detectedPart">) =>
  PLANT_PART_LABELS[detectedPart ?? plantPart];

/** "Lá · 2 vùng" / "Lá · không khoanh vùng". */
export const formatLocation = (image: Pick<TDiagnosisImage, "plantPart" | "detectedPart">, regionCount: number) =>
  `${imagePartLabel(image)} · ${regionCount > 0 ? `${regionCount} vùng` : "không khoanh vùng"}`;

/** id phần tử của 1 ảnh trong mục "Kết quả từng ảnh" — bảng tổng hợp cuộn tới đây. */
export const resultImageAnchorId = (index: number) => `diagnosis-image-${index + 1}`;
