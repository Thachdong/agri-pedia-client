import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  adminArticleCropsQuery,
  adminArticleTargetsQuery,
  ArticleEditorHeader,
  ArticleForm,
  ArticleTargetPicker,
  findArticleTarget,
  toPreviewCrop,
  type TAdminArticleCropsResponse,
  type TAdminArticleTargetsResponse,
} from "@/features/article-admin";
import { ROUTES } from "@/shared/constants";
import { isAppError } from "@/shared/lib/http";
import { serverHttp } from "@/shared/lib/http/server";
import { getPrefetchedData, HydrateQueries, prefetch } from "@/shared/lib/query/server";

export const metadata: Metadata = { title: "Viết bài mới" };

const firstParam = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/**
 * Viết bài cho 1 bệnh / variant (`?crop=&code=`, từ nút "Tạo" của bảng).
 * Thiếu `code` (vào từ menu "Create") → chọn cây + bệnh chưa có bài trước.
 * Bệnh không thuộc cây → 404; đã có bài → sang trang sửa.
 */
export default async function AdminArticleCreatePage({ searchParams }: PageProps<"/admin/articles/new">) {
  const params = await searchParams;
  const crop = firstParam(params.crop);
  const code = firstParam(params.code);

  if (!crop || !code) {
    const state = await prefetch(crop ? [adminArticleTargetsQuery(crop, serverHttp)] : []);
    return (
      <HydrateQueries state={state}>
        <ArticleTargetPicker cropSlug={crop} />
      </HydrateQueries>
    );
  }

  const targets = adminArticleTargetsQuery(crop, serverHttp);
  const crops = adminArticleCropsQuery(serverHttp);
  let state;
  try {
    state = await prefetch([crops], { required: [targets] });
  } catch (error) {
    if (isAppError(error) && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }

  const target = findArticleTarget(getPrefetchedData<TAdminArticleTargetsResponse>(state, targets.queryKey), code);
  if (!target) notFound();
  if (target.article) redirect(ROUTES.admin.articles.edit(target.code));
  const previewCrop = toPreviewCrop(getPrefetchedData<TAdminArticleCropsResponse>(state, crops.queryKey)?.crops, {
    slug: crop,
  });

  return (
    <HydrateQueries state={state}>
      <div className="flex flex-col gap-6">
        <ArticleEditorHeader mode="create" name={target.nameVi} code={target.code} cropName={previewCrop.nameVi} />
        <ArticleForm
          mode="create"
          target={{ code: target.code, nameVi: target.nameVi }}
          crop={previewCrop}
          cancelHref={ROUTES.admin.articles.list(crop)}
        />
      </div>
    </HydrateQueries>
  );
}
