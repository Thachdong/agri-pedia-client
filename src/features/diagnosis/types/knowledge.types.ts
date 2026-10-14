import type { TApiSchema } from "@/shared/lib/http";

/** Cây trồng được hỗ trợ chẩn đoán — `code` là `cropType` gửi lên POST /diagnoses (vd. RICE). */
export type TCrop = TApiSchema<"CropItemResponse">;
export type TCropsResponse = TApiSchema<"ListCropsResponse">;

/** GET /knowledge/diseases/:code — không có mục thuốc hoá học. `verification` ≠ SOURCED = chưa được chuyên gia xác nhận. */
export type TDisease = TApiSchema<"DiseaseDetailResponse">;
export type TDiseaseCategory = TDisease["category"];
export type TDiseaseAgentType = TDisease["agentType"];
export type TCropStage = TDisease["cropStages"][number];
export type TDiseaseVerification = TDisease["verification"];
