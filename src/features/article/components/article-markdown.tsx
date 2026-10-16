import { LightbulbIcon } from "lucide-react";
import Link from "next/link";
import Markdown, { type Components } from "react-markdown";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import { Callout } from "@/shared/components/molecules";
import { cn } from "@/shared/lib/utils";
import type { TArticleDetail } from "../types/article.types";
import { remarkHeadingIds } from "../utils/heading-ids.util";
import {
  ARTICLE_DIRECTIVE_ELEMENT,
  remarkArticleDirectives,
  type TArticleCalloutVariant,
} from "../utils/remark-article-directives.util";
import { ArticleCtaButton } from "./article-cta-button";
import { ArticleFigure } from "./article-figure";
import { DiseaseCard } from "./disease-card";

type TElementNode = { type: string; tagName?: string; value?: string; children?: TElementNode[] };

/** Đoạn chỉ chứa 1 ảnh → bỏ `<p>` (figure không được nằm trong p — lỗi hydrate / HTML không hợp lệ). */
function isImageOnlyParagraph(node: TElementNode | undefined): boolean {
  const children = (node?.children ?? []).filter((child) => !(child.type === "text" && !child.value?.trim()));
  return children.length === 1 && children[0].tagName === "img";
}

/** Bỏ prop `node` (cây hast) mà react-markdown truyền vào — không được rải xuống DOM. */
function withoutNode<T extends { node?: unknown }>(props: T): Omit<T, "node"> {
  const { node, ...rest } = props;
  void node;
  return rest;
}

/** Directive sinh phần tử tuỳ biến (không có trong JSX.IntrinsicElements) → khai báo props riêng. */
type TDirectiveComponents = {
  [ARTICLE_DIRECTIVE_ELEMENT.callout]: (props: { variant?: TArticleCalloutVariant; children?: React.ReactNode }) => React.ReactNode;
  [ARTICLE_DIRECTIVE_ELEMENT.diseaseCard]: (props: { code?: string }) => React.ReactNode;
  [ARTICLE_DIRECTIVE_ELEMENT.cta]: () => React.ReactNode;
};

function articleComponents(article: TArticleDetail): Components {
  const imagesByUrl = new Map(article.images.map((image) => [image.url, image]));
  const relatedByCode = new Map(article.relatedDiseases.map((disease) => [disease.code, disease]));

  const directives: TDirectiveComponents = {
    [ARTICLE_DIRECTIVE_ELEMENT.callout]: ({ variant, children }) =>
      variant === "tip" ? (
        <Callout tone="success" icon={LightbulbIcon} title="Mẹo" className="not-prose my-6">
          {children}
        </Callout>
      ) : (
        <Callout tone="warning" title="Lưu ý" className="not-prose my-6">
          {children}
        </Callout>
      ),
    [ARTICLE_DIRECTIVE_ELEMENT.diseaseCard]: ({ code }) => {
      const disease = code ? relatedByCode.get(code) : undefined;
      return disease ? <DiseaseCard disease={disease} className="my-6" /> : null;
    },
    [ARTICLE_DIRECTIVE_ELEMENT.cta]: () => <ArticleCtaButton crop={article.crop} className="my-6" />,
  };

  return {
    // Trang đã có H1 (tiêu đề bài) → h1 trong nội dung hạ xuống h2.
    h1: (props) => <h2 {...withoutNode(props)} />,
    p: (props) =>
      isImageOnlyParagraph(props.node as TElementNode) ? <>{props.children}</> : <p {...withoutNode(props)} />,
    img: ({ src }) => {
      // Server đã resolve mọi ảnh của bài vào `images`; ảnh lạ (không có kích thước / không nằm trong whitelist) → bỏ.
      const image = typeof src === "string" ? imagesByUrl.get(src) : undefined;
      return image ? <ArticleFigure image={image} /> : null;
    },
    a: (allProps) => {
      const { href, children, ...props } = withoutNode(allProps);
      if (href?.startsWith("/") && !href.startsWith("//")) {
        return (
          <Link href={href} {...props}>
            {children}
          </Link>
        );
      }
      if (href?.startsWith("#")) return <a href={href} {...props}>{children}</a>;
      return (
        <a href={href} target="_blank" rel="noopener noreferrer nofollow" {...props}>
          {children}
        </a>
      );
    },
    table: (props) => (
      <div className="scrollbar-thin my-6 overflow-x-auto">
        <table {...withoutNode(props)} className="my-0" />
      </div>
    ),
    ...(directives as Components),
  };
}

export type TArticleMarkdownProps = {
  article: TArticleDetail;
  className?: string;
};

/**
 * Nội dung markdown của bài — render ở Server Component (parser không xuống browser), không bật HTML thô
 * (chống XSS). Chỉ ảnh / CTA là client component nhỏ.
 */
export function ArticleMarkdown({ article, className }: TArticleMarkdownProps) {
  return (
    <div
      className={cn(
        "prose prose-article max-w-none prose-headings:scroll-mt-20 prose-a:underline-offset-4 prose-img:rounded-lg",
        className,
      )}
    >
      <Markdown
        remarkPlugins={[remarkGfm, remarkDirective, remarkArticleDirectives, remarkHeadingIds]}
        components={articleComponents(article)}
      >
        {article.markdown}
      </Markdown>
    </div>
  );
}
