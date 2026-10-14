import { http, type IHttpClient } from "@/shared/lib/http";
import type { TCropsResponse } from "../types/knowledge.types";

/** Public — cây trồng được hỗ trợ chẩn đoán (giai đoạn 1: chỉ lúa). */
export const getCrops = (client: IHttpClient = http) => client.get<TCropsResponse>("/knowledge/crops");
