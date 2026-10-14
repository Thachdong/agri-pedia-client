import type { TApiSchema } from "@/shared/lib/http";
import type { TDiseaseCategory } from "./knowledge.types";

type TApiDiagnosis = TApiSchema<"GetDiagnosisResponse">;
type TApiDiagnosisImage = TApiSchema<"DiagnosisImageResponse">;
type TApiDiagnosisSummary = TApiSchema<"DiagnosisSummaryResponse">;

export type TDiagnosisStatus = TApiDiagnosis["status"];
export type TPlantPart = TApiDiagnosisImage["plantPart"];
/** Kết luận của 1 ảnh — null khi diagnosis còn PROCESSING. */
export type TDiagnosisImageStatus = NonNullable<TApiDiagnosisImage["status"]>;
export type TConfidence = TApiSchema<"DiagnosisConfidenceResponse">;
export type TConfidenceLevel = TConfidence["level"];
export type TDiagnosisFeedbackValue = TApiSchema<"SubmitDiagnosisFeedbackDto">["feedback"];

/** Swagger sinh `category` thành `{}` → override bằng enum của knowledge. */
type TWithCategory<T> = Omit<T, "category"> & { category: TDiseaseCategory };

export type TDiagnosisImageDisease = TWithCategory<TApiSchema<"DiagnosisImageDiseaseResponse">>;
export type TDiagnosisSummaryDisease = TWithCategory<TApiSchema<"DiagnosisSummaryDiseaseResponse">>;
/** Bệnh gán cho 1 vùng — `regions[].diagnosis` null = vùng chưa xác định (UNCERTAIN). */
export type TDiagnosedDisease = TApiSchema<"DiagnosedDiseaseResponse">;
/** `box` 0..1 trên ảnh ở `url` (đã xoay EXIF). */
export type TDiagnosisRegion = TApiSchema<"DiagnosisRegionResponse">;

export type TDiagnosisSummary = Omit<TApiDiagnosisSummary, "diseases"> & { diseases: TDiagnosisSummaryDisease[] };
export type TDiagnosisImage = Omit<TApiDiagnosisImage, "diseases"> & { diseases: TDiagnosisImageDisease[] };

/** GET /diagnoses/:id — PROCESSING: `summary` null, `images[].status` null, `regions` rỗng. */
export type TDiagnosis = Omit<TApiDiagnosis, "summary" | "images"> & {
  summary: TDiagnosisSummary | null;
  images: TDiagnosisImage[];
};

/** Field `meta` (JSON) của POST /diagnoses — mỗi ảnh một entry, cùng thứ tự file. */
export type TCreateDiagnosisMeta = {
  cropType: string;
  images: { plantPart: TPlantPart }[];
  note?: string;
};

/** Input của mutation tạo chẩn đoán — `blob` là JPEG đã nén ở client. */
export type TCreateDiagnosisInput = {
  cropType: string;
  images: { blob: Blob; plantPart: TPlantPart }[];
  note?: string;
};
export type TCreateDiagnosisResponse = TApiSchema<"CreateDiagnosisResponse">;

/** Item GET /diagnoses — `thumbnail` signed URL ảnh đầu (null nếu chưa lưu); `diseases` rỗng khi PROCESSING / FAILED. */
export type TDiagnosisListItem = TApiSchema<"DiagnosisListItemResponse">;
export type TDiagnosisListPage = TApiSchema<"ListMyDiagnosesResponse">;

export type TDiagnosisFeedbackInput = TApiSchema<"SubmitDiagnosisFeedbackDto">;

/** Payload realtime `diagnosis.completed`. */
export type TDiagnosisCompletedEvent = { id: string; status: Exclude<TDiagnosisStatus, "PROCESSING"> };

/** 1 ô ảnh của form — `file` ảnh gốc người dùng chọn; nén lúc gửi. */
export type TDiagnosisFormImage = {
  id: string;
  file: File;
  /** "" = chưa chọn. */
  plantPart: TPlantPart | "";
};

export type TDiagnosisFormValues = {
  images: TDiagnosisFormImage[];
  note: string;
};

export type TDiagnosisFeedbackFormValues = {
  feedback: TDiagnosisFeedbackValue | "";
  comment: string;
};
