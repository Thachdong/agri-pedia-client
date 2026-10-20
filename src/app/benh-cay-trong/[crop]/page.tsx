import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import {
  ARTICLE_LIST_PAGE_SIZE,
  ARTICLES_INDEX_LABEL,
  ArticleCtaButton,
  articleFetchOptions,
  ArticleList,
  listArticles,
} from "@/features/article";
import { Breadcrumb } from "@/shared/components/molecules";
import { ROUTES } from "@/shared/constants";
import { isAppError } from "@/shared/lib/http";
import { publicServerHttp } from "@/shared/lib/http/public-server";

/** ISR 1 giờ (= ARTICLE_REVALIDATE_SECONDS; phải là literal) — đổi bài đến qua tag `articles:<crop>`. */
export const revalidate = 3600;

export function generateStaticParams() {
  return [];
}

/** Trang đầu (không lọc) render ở server cho SEO; slug cây lạ (404) / sai dạng (400) → notFound(). */
const loadFirstPage = cache(async (crop: string) => {
  try {
    return await listArticles(
      { crop, limit: ARTICLE_LIST_PAGE_SIZE },
      publicServerHttp,
      articleFetchOptions.list(crop),
    );
  } catch (error) {
    if (isAppError(error) && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }
});

export async function generateMetadata({ params }: PageProps<"/benh-cay-trong/[crop]">): Promise<Metadata> {
  const { crop } = await params;
  const { crop: info } = await loadFirstPage(crop);
  const title = `Bệnh hại ${info.nameVi.toLowerCase()}`;
  const description = `Nhận biết và phòng trừ bệnh, sâu hại và rối loạn sinh lý trên cây ${info.nameVi.toLowerCase()}: triệu chứng, nguyên nhân, cách phòng.`;
  return {
    title,
    description,
    alternates: { canonical: ROUTES.articles.crop(info.slug) },
    openGraph: { url: ROUTES.articles.crop(info.slug), title, description },
  };
}

/** Danh sách bài của 1 cây (public, ISR) — spec disease-articles-plan.md §4.2. */
export default async function ArticleCropPage({ params }: PageProps<"/benh-cay-trong/[crop]">) {
  const { crop } = await params;
  const firstPage = await loadFirstPage(crop);
  const { crop: info } = firstPage;

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb items={[{ label: ARTICLES_INDEX_LABEL, href: ROUTES.articles.index }, { label: info.nameVi }]} />
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold sm:text-3xl">Bệnh hại {info.nameVi.toLowerCase()}</h1>
        <p className="text-muted-foreground">
          Triệu chứng, nguyên nhân và cách phòng các bệnh, sâu hại thường gặp trên cây {info.nameVi.toLowerCase()}.
        </p>
      </header>
      <ArticleCtaButton crop={info} />
      <ArticleList cropSlug={info.slug} initialPage={firstPage} />
    </div>
  );
}
