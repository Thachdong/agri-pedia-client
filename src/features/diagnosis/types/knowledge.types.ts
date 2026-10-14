import type { TApiSchema } from "@/shared/lib/http";

/** Cây trồng được hỗ trợ chẩn đoán — `code` là `cropType` gửi lên POST /diagnoses (vd. RICE). */
export type TCrop = TApiSchema<"CropItemResponse">;
export type TCropsResponse = TApiSchema<"ListCropsResponse">;
