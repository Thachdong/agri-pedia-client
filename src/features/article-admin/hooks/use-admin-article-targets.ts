import { useAppQuery } from "@/shared/lib/query";
import { adminArticleTargetsQuery } from "./article-admin.queries";

/** `cropSlug` rỗng (chưa chọn cây) → không gọi. */
export const useAdminArticleTargets = (cropSlug: string | undefined) =>
  useAppQuery({ ...adminArticleTargetsQuery(cropSlug ?? ""), enabled: Boolean(cropSlug) });
