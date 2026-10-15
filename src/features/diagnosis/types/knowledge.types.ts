import type { TApiSchema } from "@/shared/lib/http";

/** Cây trồng được hỗ trợ chẩn đoán — `code` là `cropType` gửi lên POST /diagnoses (vd. RICE). */
export type TCrop = TApiSchema<"CropItemResponse">;
export type TCropsResponse = TApiSchema<"ListCropsResponse">;
/** Bộ phận ảnh có thể chụp của 1 cây — giá trị `plantPart` hợp lệ cho POST /diagnoses, theo thứ tự dropdown. */
export type TCropPlantPart = TApiSchema<"CropPlantPartResponse">;
/** Nhãn giai đoạn theo cây (cùng mã có thể khác nhãn giữa các cây, vd. SEEDLING). */
export type TCropStageItem = TApiSchema<"CropStageResponse">;

/** GET /knowledge/diseases/:code — không có mục thuốc hoá học. `verification` ≠ SOURCED = chưa được chuyên gia xác nhận. */
export type TDisease = TApiSchema<"DiseaseDetailResponse">;
export type TDiseaseCategory = TDisease["category"];
export type TDiseaseAgentType = TDisease["agentType"];
export type TCropStage = TDisease["cropStages"][number];
export type TDiseaseVerification = TDisease["verification"];
