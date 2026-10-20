import type { Metadata } from "next";
import { cropTopArticlesQuery, TopArticleLimitForm, TopArticlesEditor, topArticleSettingsQuery } from "@/features/admin-settings";
import { adminArticleCropsQuery, adminArticleTargetsQuery, type TAdminArticleCropsResponse } from "@/features/article-admin";
import { serverHttp } from "@/shared/lib/http/server";
import { getPrefetchedData, HydrateQueries, prefetch } from "@/shared/lib/query/server";

export const metadata: Metadata = { title: "Bài viết nổi bật" };

const firstParam = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/**
 * Bài viết nổi bật (Specs/19102026/admin.md): số bài mỗi cây + danh sách của 1 cây (`?crop=`, mặc định cây đầu tiên).
 * Cây dùng chung cache với layout; danh sách và bài của cây prefetch để không nháy skeleton.
 */
export default async function AdminTopArticlesPage({ searchParams }: PageProps<"/admin/settings/top-articles">) {
  const crop = firstParam((await searchParams).crop);
  let cropSlug = crop;
  if (!cropSlug) {
    const crops = adminArticleCropsQuery(serverHttp);
    cropSlug = getPrefetchedData<TAdminArticleCropsResponse>(await prefetch([crops]), crops.queryKey)?.crops[0]?.slug;
  }
  const state = await prefetch([
    topArticleSettingsQuery(serverHttp),
    ...(cropSlug ? [cropTopArticlesQuery(cropSlug, serverHttp), adminArticleTargetsQuery(cropSlug, serverHttp)] : []),
  ]);
  return (
    <HydrateQueries state={state}>
      <div className="flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">Bài viết nổi bật</h1>
          <p className="text-sm text-muted-foreground">Các bài hiện ở trang chủ theo từng cây trồng.</p>
        </header>
        <TopArticleLimitForm />
        <TopArticlesEditor cropSlug={crop} />
      </div>
    </HydrateQueries>
  );
}
