import type { Metadata } from "next";
import { ARTICLES_INDEX_LABEL, ArticleCropCard, articleFetchOptions, listArticleCrops } from "@/features/article";
import { Callout } from "@/shared/components/molecules";
import { ROUTES } from "@/shared/constants";
import { publicServerHttp } from "@/shared/lib/http/public-server";

/** ISR 30 ngày (= ARTICLE_REVALIDATE_SECONDS; phải là literal) — đổi danh sách đến qua tag `articles`. */
export const revalidate = 2592000;

const DESCRIPTION =
  "Thư viện bệnh hại cây trồng: triệu chứng, nguyên nhân và cách phòng bệnh, sâu hại, rối loạn sinh lý theo từng loại cây.";

export const metadata: Metadata = {
  title: ARTICLES_INDEX_LABEL,
  description: DESCRIPTION,
  alternates: { canonical: ROUTES.articles.index },
  openGraph: { url: ROUTES.articles.index, title: ARTICLES_INDEX_LABEL, description: DESCRIPTION },
};

/** Danh sách cây có bài viết (public, ISR) — spec disease-articles-plan.md §4.3. */
export default async function ArticleCropsPage() {
  const { crops } = await listArticleCrops(publicServerHttp, articleFetchOptions.crops());

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold sm:text-3xl">{ARTICLES_INDEX_LABEL}</h1>
        <p className="text-muted-foreground">{DESCRIPTION}</p>
      </header>
      {crops.length === 0 ? (
        <Callout tone="neutral" title="Chưa có bài viết">
          Thư viện đang được biên soạn, vui lòng quay lại sau.
        </Callout>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {crops.map((crop) => (
            <li key={crop.slug}>
              <ArticleCropCard crop={crop} className="h-full" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
