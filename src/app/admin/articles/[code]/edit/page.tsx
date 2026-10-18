import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  adminArticleCropsQuery,
  adminArticleQuery,
  ArticleForm,
  type TAdminArticleCropsResponse,
  type TAdminArticleDetail,
} from "@/features/article-admin";
import { ArticleOriginBadge } from "@/features/article";
import { ROUTES } from "@/shared/constants";
import { isAppError } from "@/shared/lib/http";
import { serverHttp } from "@/shared/lib/http/server";
import { getPrefetchedData, HydrateQueries, prefetch } from "@/shared/lib/query/server";

export const metadata: Metadata = { title: "Sửa bài viết" };

/** Sửa bài `code` — nội dung như đang lưu. Lưu xong bài thành “kiểm duyệt bởi Admin” (bài AI → AI_REVIEWED). */
export default async function AdminArticleEditPage({ params }: PageProps<"/admin/articles/[code]/edit">) {
  const { code } = await params;
  const article = adminArticleQuery(code, serverHttp);
  const crops = adminArticleCropsQuery(serverHttp);

  let state;
  try {
    state = await prefetch([crops], { required: [article] });
  } catch (error) {
    if (isAppError(error) && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }

  const data = getPrefetchedData<TAdminArticleDetail>(state, article.queryKey);
  if (!data) notFound();
  const cropInfo = getPrefetchedData<TAdminArticleCropsResponse>(state, crops.queryKey)?.crops.find(
    (item) => item.slug === data.crop.slug,
  );

  return (
    <HydrateQueries state={state}>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <ArticleOriginBadge origin={data.origin} />
            <code className="text-xs text-muted-foreground">{data.code}</code>
          </div>
          <h1 className="text-xl font-semibold">Sửa bài: {data.title}</h1>
          {data.origin === "AI" && (
            <p className="text-sm text-muted-foreground">
              Bài do AI tạo — sau khi lưu sẽ được đánh dấu “Nội dung được kiểm duyệt bởi Admin” và không bị seed ghi đè.
            </p>
          )}
        </header>
        <ArticleForm
          // Đổi bài → form mới (defaultValues chỉ đọc lúc mount).
          key={data.code}
          mode="update"
          article={data}
          crop={{
            code: data.crop.code,
            slug: data.crop.slug,
            nameVi: cropInfo?.nameVi ?? data.crop.slug,
            diagnosisEnabled: cropInfo?.diagnosisEnabled ?? false,
          }}
          cancelHref={ROUTES.admin.articles.detail(data.code)}
        />
      </div>
    </HydrateQueries>
  );
}
