import type { Metadata } from "next";
import {
  adminArticleCropsQuery,
  adminArticleTargetsQuery,
  ArticleTargetTable,
  type TAdminArticleCropsResponse,
} from "@/features/article-admin";
import { serverHttp } from "@/shared/lib/http/server";
import { getPrefetchedData, HydrateQueries, prefetch } from "@/shared/lib/query/server";

export const metadata: Metadata = { title: "Bài viết" };

const firstParam = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/**
 * Danh sách bài viết (admin-page.png (4)): bảng bệnh + bài của 1 cây (`?crop=`, mặc định cây đầu tiên).
 * Cây dùng chung cache với layout; bảng của cây được prefetch để không nháy skeleton. Lỗi → bảng tự hiện lỗi.
 */
export default async function AdminArticlesPage({ searchParams }: PageProps<"/admin/articles">) {
  const crop = firstParam((await searchParams).crop);

  let cropSlug = crop;
  if (!cropSlug) {
    const crops = adminArticleCropsQuery(serverHttp);
    cropSlug = getPrefetchedData<TAdminArticleCropsResponse>(await prefetch([crops]), crops.queryKey)?.crops[0]?.slug;
  }
  const state = await prefetch(cropSlug ? [adminArticleTargetsQuery(cropSlug, serverHttp)] : []);

  return (
    <HydrateQueries state={state}>
      <ArticleTargetTable cropSlug={crop} />
    </HydrateQueries>
  );
}
