import { notFound, permanentRedirect } from "next/navigation";
import { articleFetchOptions, getDiseaseArticleLink } from "@/features/article";
import { isAppError } from "@/shared/lib/http";
import { publicServerHttp } from "@/shared/lib/http/public-server";

/** ISR 1 giờ (= ARTICLE_REVALIDATE_SECONDS; phải là literal) — bài mới / đổi slug đến qua tag `article-disease:<CODE>`. */
export const revalidate = 3600;

export function generateStaticParams() {
  return [];
}

/**
 * Link cũ / link từ kết quả chẩn đoán: redirect 308 sang bài viết của bệnh (`/benh-cay-trong/<crop>/<slug>`).
 * Bệnh chưa có bài, mã lạ (404) hoặc sai dạng (400) → notFound().
 */
export default async function DiseaseRedirectPage({ params }: PageProps<"/diseases/[code]">) {
  const { code } = await params;

  let article;
  try {
    article = await getDiseaseArticleLink(code, publicServerHttp, articleFetchOptions.diseaseLink(code));
  } catch (error) {
    if (isAppError(error) && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }

  if (!article) notFound();
  permanentRedirect(article.path);
}
