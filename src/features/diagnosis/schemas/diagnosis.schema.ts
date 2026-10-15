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

/** Mirror POST /diagnoses meta (action 36): 1..5 ảnh, plantPart tuỳ chọn ở form (server bắt buộc → gửi mặc định), note ≤ 1000. Định dạng / dung lượng ảnh do bước nén xử lý. */
export const diagnosisFormSchema = schema<TDiagnosisFormValues>({
  images: v
    .array()
    .items(diagnosisImage)
    .min(1)
    .max(DIAGNOSIS_MAX_IMAGES)
    .required()
    .messages({
      "array.min": "Thêm ít nhất 1 ảnh",
      "array.max": `Tối đa ${DIAGNOSIS_MAX_IMAGES} ảnh`,
    }),
  note: v.string().trim().allow("").max(DIAGNOSIS_NOTE_MAX),
});

