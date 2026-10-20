import Image from "next/image";
import { Breadcrumb } from "@/shared/components/molecules";
import { ROUTES } from "@/shared/constants";
import { cn } from "@/shared/lib/utils";
import type { TArticleDetail } from "../types/article.types";
import { ARTICLES_INDEX_LABEL } from "../utils/article-json-ld.util";
import { extractArticleToc } from "../utils/heading-ids.util";
import { ArticleCtaButton } from "./article-cta-button";
import { ArticleDiseaseInfo } from "./article-disease-info";
import { ArticleMarkdown } from "./article-markdown";
import { ArticleMeta } from "./article-meta";
import { ArticleSources } from "./article-sources";
import { ArticleToc } from "./article-toc";
import { CategoryPlaceholder } from "./category-placeholder";
import { DraftBanner } from "./draft-banner";
import { RelatedDiseaseList } from "./related-disease-list";

export type TArticleDetailProps = {
  article: TArticleDetail;
  className?: string;
};

/**
 * Toàn bộ bài viết (spec §4.1): breadcrumb, banner nháp, tiêu đề + meta, thông tin bệnh, cover, mục lục,
 * nội dung, nguồn, bệnh liên quan, CTA chẩn đoán. Server Component — chỉ ảnh / CTA là client.
 */
export function ArticleDetail({ article, className }: TArticleDetailProps) {
  const category = article.disease?.category ?? null;

  return (
    <article className={cn("flex flex-col gap-6", className)}>
      <Breadcrumb
        items={[
          { label: ARTICLES_INDEX_LABEL, href: ROUTES.articles.index },
          { label: article.crop.nameVi, href: ROUTES.articles.crop(article.crop.slug) },
          { label: article.title },
        ]}
      />
      {article.status === "DRAFT" && <DraftBanner />}

      <header className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold sm:text-3xl">{article.title}</h1>
        <p className="text-muted-foreground">{article.summary}</p>
        <ArticleMeta
          updatedAt={article.updatedAt}
          origin={article.origin}
          verification={article.disease?.verification ?? null}
        />
      </header>

      {article.cover ? (
        <Image
          src={article.cover.url}
          alt={article.cover.alt}
          width={article.cover.width}
          height={article.cover.height}
          priority
          sizes="(max-width: 768px) 100vw, 768px"
          className="aspect-video w-full rounded-lg border border-border-subtle object-cover"
        />
      ) : (
        <CategoryPlaceholder category={category} size="lg" className="aspect-video w-full rounded-lg" />
      )}

      {article.disease && <ArticleDiseaseInfo disease={article.disease} />}
      <ArticleToc headings={extractArticleToc(article.markdown)} />
      <ArticleMarkdown article={article} />
      <ArticleSources sources={article.sources} images={article.images} />
      <RelatedDiseaseList diseases={article.relatedDiseases} />
      <ArticleCtaButton crop={article.crop} />
    </article>
  );
}
