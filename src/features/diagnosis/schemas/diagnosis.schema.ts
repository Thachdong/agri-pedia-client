import { schema, v } from "@/shared/lib/validation";
import { DIAGNOSIS_MAX_IMAGES, DIAGNOSIS_NOTE_MAX, PLANT_PARTS } from "../constants/diagnosis.constants";
import type { TDiagnosisFormValues } from "../types/diagnosis.types";


const diagnosisImage = schema<TDiagnosisFormValues["images"][number]>({
  id: v.string().required(),
  file: v.any().required(),
  // Tuỳ chọn — để trống thì gửi DEFAULT_PLANT_PART.
  plantPart: v
    .string()
    .valid(...PLANT_PARTS, "")
    .required(),
});

/** Context của resolver — số ảnh tối đa theo GET /diagnoses/settings (`maxImages`, admin cấu hình). */
export type TDiagnosisFormContext = { maxImages: number };

/**
 * Mirror POST /diagnoses meta: 1..`$maxImages` ảnh (context, mặc định DIAGNOSIS_MAX_IMAGES), plantPart tuỳ chọn ở form
 * (server bắt buộc → gửi mặc định), note ≤ 1000. Định dạng / dung lượng / kích thước ảnh do bước nén xử lý.
 */
export const diagnosisFormSchema = schema<TDiagnosisFormValues>({
  images: v
    .array()
    .items(diagnosisImage)
    .min(1)
    // Không dùng .max(v.ref("$maxImages")): message hiện tên ref thay vì con số.
    .custom((images: unknown[], helpers) => {
      const { maxImages } = (helpers.prefs.context ?? {}) as Partial<TDiagnosisFormContext>;
      const limit = maxImages ?? DIAGNOSIS_MAX_IMAGES;
      return images.length > limit ? helpers.error("array.max", { limit }) : images;
    })
    .required()
    .messages({
      "array.min": "Thêm ít nhất 1 ảnh",
      "array.max": "Tối đa {#limit} ảnh",
    }),
  note: v.string().trim().allow("").max(DIAGNOSIS_NOTE_MAX),
});

