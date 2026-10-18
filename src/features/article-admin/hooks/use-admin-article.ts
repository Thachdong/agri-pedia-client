import { useAppQuery } from "@/shared/lib/query";
import { adminArticleQuery } from "./article-admin.queries";

export const useAdminArticle = (code: string) => useAppQuery(adminArticleQuery(code));
