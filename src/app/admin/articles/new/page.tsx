import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  adminArticleCropsQuery,
  adminArticleTargetsQuery,
  ArticleForm,
  ArticleTargetPicker,
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

  const target = getPrefetchedData<TAdminArticleTargetsResponse>(state, targets.queryKey)?.targets.find(
    (item) => item.code === code,
  );
  if (!target) notFound();
  if (target.article) redirect(ROUTES.admin.articles.edit(target.code));

  const cropInfo = getPrefetchedData<TAdminArticleCropsResponse>(state, crops.queryKey)?.crops.find(
    (item) => item.slug === crop,
  );

  return (
    <HydrateQueries state={state}>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">Viết bài: {target.nameVi}</h1>
          <p className="text-sm text-muted-foreground">
            <code>{target.code}</code> · {cropInfo?.nameVi ?? crop} — bài được publish ngay, đánh dấu “Nội dung được kiểm
            duyệt bởi Admin”.
          </p>
        </header>
        <ArticleForm
          mode="create"
          target={{ code: target.code, nameVi: target.nameVi }}
          crop={{
            code: cropInfo?.code ?? "",
            slug: crop,
            nameVi: cropInfo?.nameVi ?? crop,
            diagnosisEnabled: cropInfo?.diagnosisEnabled ?? false,
          }}
          cancelHref={ROUTES.admin.articles.list(crop)}
        />
      </div>
    </HydrateQueries>
  );
}
