import type { TDiagnosisImage, TDiagnosisRegion, TPlantPart } from "../types/diagnosis.types";

/** Nhãn bộ phận theo cây — `useCropLabels(cropType).partLabel`. */
type TPartLabel = (code: TPlantPart) => string;

/** Vùng của 1 bệnh trên ảnh (theo diseaseCode). */
export const regionsOfDisease = (image: Pick<TDiagnosisImage, "regions">, diseaseCode: string) =>
  image.regions.filter((region) => region.diagnosis?.diseaseCode === diseaseCode);

/** Triệu chứng không trùng, giữ thứ tự xuất hiện. */
export const uniqueSymptoms = (regions: TDiagnosisRegion[]) => [...new Set(regions.map((region) => region.symptom))];

/** Bộ phận của ảnh — ưu tiên bộ phận AI nhận diện, không có thì bộ phận người dùng chọn. */
export const imagePartLabel = (
  { plantPart, detectedPart }: Pick<TDiagnosisImage, "plantPart" | "detectedPart">,
  partLabel: TPartLabel,
) => partLabel(detectedPart ?? plantPart);

/** "Lá · 2 vùng" / "Lá · không khoanh vùng". */
export const formatLocation = (
  image: Pick<TDiagnosisImage, "plantPart" | "detectedPart">,
  regionCount: number,
  partLabel: TPartLabel,
) => `${imagePartLabel(image, partLabel)} · ${regionCount > 0 ? `${regionCount} vùng` : "không khoanh vùng"}`;

/** id phần tử của 1 ảnh trong mục "Kết quả từng ảnh" — bảng tổng hợp cuộn tới đây. */
export const resultImageAnchorId = (index: number) => `diagnosis-image-${index + 1}`;
