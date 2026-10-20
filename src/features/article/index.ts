// Public API của feature `article` (bài viết bệnh cây trồng — public, ISR, SEO).
export {
  ARTICLE_CACHE_TAG_MAX_LENGTH,
  ARTICLE_CACHE_TAG_PATTERN,
  ARTICLE_CACHE_TAGS,
  ARTICLE_ERROR_CODE,
  ARTICLE_LIST_PAGE_SIZE,
  ARTICLE_ORIGIN_LABELS,
  ARTICLE_REVALIDATE_MAX_TAGS,
  ARTICLE_REVALIDATE_SECONDS,
  articleFetchOptions,
} from "./constants/article.constants";
export { ArticleCropCard, type TArticleCropCardProps } from "./components/article-crop-card";
export { ArticleCtaButton, type TArticleCtaButtonProps } from "./components/article-cta-button";
export { ArticleDetail, type TArticleDetailProps } from "./components/article-detail";
export { ArticleList, type TArticleListProps } from "./components/article-list";
export {
  ArticleMarkdown,
  type TArticleMarkdownProps,
  type TArticleMarkdownSource,
} from "./components/article-markdown";
export { ArticleOriginBadge, type TArticleOriginBadgeProps } from "./components/article-origin-badge";
export { articleListQuery } from "./hooks/article.queries";
export { useArticleList } from "./hooks/use-article-list";
export { getArticle, getArticleSitemap, getTopArticles, listArticleCrops, listArticles } from "./services/article.service";
export type {
  TArticleAffectedPart,
  TArticleCategory,
  TArticleCover,
  TArticleCrop,
  TArticleCropsResponse,
  TArticleDetail,
  TArticleDisease,
  TArticleImage,
  TArticleListFilters,
  TArticleListItem,
  TArticleListParams,
  TArticleListResponse,
  TArticleOrigin,
  TArticleSitemap,
  TArticleSource,
  TArticleStatus,
  TArticleVerification,
  TRelatedDisease,
  TTopArticlesGroup,
  TTopArticlesResponse,
} from "./types/article.types";
export { ARTICLES_INDEX_LABEL, articleJsonLd } from "./utils/article-json-ld.util";
