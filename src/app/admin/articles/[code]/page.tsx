import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminArticleQuery, AdminArticlePreview } from "@/features/article-admin";
import { isAppError } from "@/shared/lib/http";
import { serverHttp } from "@/shared/lib/http/server";
import { HydrateQueries, prefetch } from "@/shared/lib/query/server";

export const metadata: Metadata = { title: "Xem bài viết" };

/** Xem bài `code` như trang public — kể cả bài đang ẩn. Không có bài → 404. */
export default async function AdminArticleViewPage({ params }: PageProps<"/admin/articles/[code]">) {
  const { code } = await params;

  let state;
  try {
    state = await prefetch([], { required: [adminArticleQuery(code, serverHttp)] });
  } catch (error) {
    if (isAppError(error) && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }

  return (
    <HydrateQueries state={state}>
      <AdminArticlePreview code={code} />
    </HydrateQueries>
  );
}
