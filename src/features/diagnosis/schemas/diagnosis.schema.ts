import { schema, v } from "@/shared/lib/validation";
import { DIAGNOSIS_MAX_IMAGES, DIAGNOSIS_NOTE_MAX, PLANT_PARTS } from "../constants/diagnosis.constants";
import type { TDiagnosisFormValues } from "../types/diagnosis.types";

const PLANT_PART_REQUIRED = "Chọn bộ phận";

const diagnosisImage = schema<TDiagnosisFormValues["images"][number]>({
  id: v.string().required(),
  file: v.any().required(),
  plantPart: v
    .string()
    .valid(...PLANT_PARTS)
    .required()
    .messages({ "any.only": PLANT_PART_REQUIRED, "string.empty": PLANT_PART_REQUIRED, "any.required": PLANT_PART_REQUIRED }),
});

/** Mirror POST /diagnoses meta (action 36): 1..5 ảnh, mỗi ảnh 1 plantPart, note ≤ 1000 (tuỳ chọn). Định dạng / dung lượng ảnh do bước nén xử lý. */
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

