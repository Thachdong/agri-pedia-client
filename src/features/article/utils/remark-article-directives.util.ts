import type { Parent, Root, RootContent } from "mdast";
import type { ContainerDirective, LeafDirective, TextDirective } from "mdast-util-directive";
import { SKIP, visit } from "unist-util-visit";
import { publicEnv } from "@/shared/config";

type TDirective = ContainerDirective | LeafDirective | TextDirective;

/** Tên phần tử tuỳ biến sinh ra từ directive — `articleComponents` map chúng sang React component. */
export const ARTICLE_DIRECTIVE_ELEMENT = {
  callout: "article-callout",
  diseaseCard: "article-disease-card",
  cta: "article-cta",
} as const;

export type TArticleCalloutVariant = "warning" | "tip";

const CALLOUT_VARIANTS: readonly string[] = ["warning", "tip"] satisfies TArticleCalloutVariant[];

function isDirective(node: { type: string }): node is TDirective {
  return node.type === "containerDirective" || node.type === "leafDirective" || node.type === "textDirective";
}

function toElement(node: TDirective, hName: string, hProperties: Record<string, string> = {}) {
  node.data = { ...node.data, hName, hProperties };
}

/**
 * Plugin remark (sau `remark-directive`): đổi directive của bài viết sang phần tử tuỳ biến qua `data.hName`.
 * - `:::warning` / `:::tip` → `article-callout` `{ variant }`
 * - `::disease-card{code="..."}` → `article-disease-card` `{ code }` (thiếu code → bỏ)
 * - `::cta-diagnosis` → `article-cta`
 * - container/leaf directive khác → bỏ node; text directive khác (vd. "Lưu ý:phun") → trả lại chữ như cũ.
 */
export function remarkArticleDirectives() {
  return (tree: Root) => {
    visit(tree, (node, index, parent: Parent | undefined) => {
      if (!isDirective(node) || !parent || index === undefined) return;

      if (node.type === "containerDirective" && CALLOUT_VARIANTS.includes(node.name)) {
        toElement(node, ARTICLE_DIRECTIVE_ELEMENT.callout, { variant: node.name });
        return;
      }
      if (node.type === "leafDirective" && node.name === "disease-card" && node.attributes?.code) {
        toElement(node, ARTICLE_DIRECTIVE_ELEMENT.diseaseCard, { code: node.attributes.code });
        node.children = [];
        return;
      }
      if (node.type === "leafDirective" && node.name === "cta-diagnosis") {
        toElement(node, ARTICLE_DIRECTIVE_ELEMENT.cta);
        node.children = [];
        return;
      }

      if (node.type === "textDirective") {
        // remark-directive tách nhầm chữ dạng ":abc" thành directive → khôi phục thành text.
        const restored: RootContent[] = [{ type: "text", value: `:${node.name}` }, ...node.children];
        parent.children.splice(index, 1, ...(restored as Parent["children"]));
        return [SKIP, index + restored.length];
      }

      if (publicEnv.isDev) {
        console.warn(`[article] directive không hỗ trợ, đã bỏ: ${node.name}`);
      }
      parent.children.splice(index, 1);
      return [SKIP, index];
    });
  };
}
