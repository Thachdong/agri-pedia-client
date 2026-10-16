import { http, type IHttpClient } from "@/shared/lib/http";
import type { TCropsResponse, TDisease } from "../types/knowledge.types";

/** Public — cây trồng được hỗ trợ chẩn đoán (giai đoạn 1: chỉ lúa). */
export const getCrops = (client: IHttpClient = http) => client.get<TCropsResponse>("/knowledge/crops");

/** Public — bài viết tiếng Việt của 1 bệnh; mã lạ → 404 KNOWLEDGE_DISEASE_NOT_FOUND. */
export const getDisease = (code: string, client: IHttpClient = http) =>
  client.get<TDisease>(`/knowledge/diseases/${encodeURIComponent(code)}`);
