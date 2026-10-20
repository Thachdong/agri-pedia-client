import { useAppQuery } from "@/shared/lib/query";
import { topArticleSettingsQuery } from "./admin-settings.queries";

export const useTopArticleSettings = () => useAppQuery(topArticleSettingsQuery());
