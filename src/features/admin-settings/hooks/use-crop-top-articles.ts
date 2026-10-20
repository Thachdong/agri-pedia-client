import { useAppQuery } from "@/shared/lib/query";
import { cropTopArticlesQuery } from "./admin-settings.queries";

/** `cropSlug` undefined (chưa chọn cây) → không gọi API. */
export const useCropTopArticles = (cropSlug: string | undefined) =>
  useAppQuery({ ...cropTopArticlesQuery(cropSlug ?? ""), enabled: Boolean(cropSlug) });
