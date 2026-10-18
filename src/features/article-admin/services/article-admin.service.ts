import { http, type IHttpClient } from "@/shared/lib/http";
import type { TAdminArticleCropsResponse, TAdminArticleTargetsResponse } from "../types/article-admin.types";

/** Mọi cây theo thứ tự hiển thị, kèm số bài. 403 KNOWLEDGE_ADMIN_REQUIRED nếu không phải ADMIN. */
export const listAdminArticleCrops = (client: IHttpClient = http) =>
  client.get<TAdminArticleCropsResponse>("/admin/knowledge/crops");

/** Bệnh + variant của 1 cây kèm bài (mọi trạng thái hiển thị). 404 KNOWLEDGE_CROP_NOT_FOUND. */
export const listAdminArticleTargets = (cropSlug: string, client: IHttpClient = http) =>
  client.get<TAdminArticleTargetsResponse>(`/admin/knowledge/crops/${encodeURIComponent(cropSlug)}/articles`);
