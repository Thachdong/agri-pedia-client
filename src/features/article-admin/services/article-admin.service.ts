import { http, type IHttpClient } from "@/shared/lib/http";
import type { TAdminArticleCropsResponse } from "../types/article-admin.types";

/** Mọi cây theo thứ tự hiển thị, kèm số bài. 403 KNOWLEDGE_ADMIN_REQUIRED nếu không phải ADMIN. */
export const listAdminArticleCrops = (client: IHttpClient = http) =>
  client.get<TAdminArticleCropsResponse>("/admin/knowledge/crops");
