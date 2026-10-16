import GithubSlugger from "github-slugger";
import type { Heading, Root } from "mdast";
import { toString } from "mdast-util-to-string";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { removeDiacritics } from "@/shared/utils";

/** Mục của mục lục — `id` trùng `id` của thẻ heading đã render (deep link `#trieu-chung`). */
export type TArticleHeading = { depth: 2 | 3; text: string; id: string };

function isTocHeading(node: Heading): node is Heading & { depth: 2 | 3 } {
  return node.depth === 2 || node.depth === 3;
}

/**
 * Gán `id` cho h2/h3 của cây mdast (bỏ dấu trước khi slug, trùng tên → `-1`, `-2`) và trả danh sách heading.
 * Một nguồn duy nhất cho cả render (remarkHeadingIds) lẫn mục lục (extractArticleToc) nên id luôn khớp.
 */
function assignHeadingIds(tree: Root): TArticleHeading[] {
  const slugger = new GithubSlugger();
  const headings: TArticleHeading[] = [];
  visit(tree, "heading", (node) => {
    if (!isTocHeading(node)) return;
    const text = toString(node).trim();
    const id = slugger.slug(removeDiacritics(text));
    node.data = { ...node.data, hProperties: { id } };
    headings.push({ depth: node.depth, text, id });
  });
  return headings;
}

/** Plugin remark: thêm `id` cho h2/h3 của bài viết. */
export function remarkHeadingIds() {
  return (tree: Root) => {
    assignHeadingIds(tree);
  };
}

/** Mục lục từ markdown — parse cùng cú pháp với ArticleMarkdown (gfm + directive). */
export function extractArticleToc(markdown: string): TArticleHeading[] {
  const tree = unified().use(remarkParse).use(remarkGfm).use(remarkDirective).parse(markdown);
  return assignHeadingIds(tree);
}
