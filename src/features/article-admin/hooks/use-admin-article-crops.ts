import { useAppQuery } from "@/shared/lib/query";
import { adminArticleCropsQuery } from "./article-admin.queries";

export const useAdminArticleCrops = () => useAppQuery(adminArticleCropsQuery());
