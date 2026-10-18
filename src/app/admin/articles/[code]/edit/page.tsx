import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  adminArticleCropsQuery,
  adminArticleQuery,
  ArticleEditorHeader,
  ArticleForm,
  toPreviewCrop,
  type TAdminArticleCropsResponse,
  type TAdminArticleDetail,
} from "@/features/article-admin";
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

  return (
    <HydrateQueries state={state}>
      <div className="flex flex-col gap-6">
        <ArticleEditorHeader mode="update" title={data.title} code={data.code} origin={data.origin} />
        <ArticleForm
          // Đổi bài → form mới (defaultValues chỉ đọc lúc mount).
          key={data.code}
          mode="update"
          article={data}
          crop={toPreviewCrop(getPrefetchedData<TAdminArticleCropsResponse>(state, crops.queryKey)?.crops, data.crop)}
          cancelHref={ROUTES.admin.articles.detail(data.code)}
        />
      </div>
    </HydrateQueries>
  );
}
