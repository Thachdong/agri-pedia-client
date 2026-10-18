import { ShieldCheckIcon, SparklesIcon } from "lucide-react";
import { Badge, type TBadgeProps } from "@/shared/components/atoms";
import { ARTICLE_ORIGIN_LABELS } from "../constants/article.constants";
import type { TArticleOrigin } from "../types/article.types";

export type TArticleOriginBadgeProps = Omit<TBadgeProps, "tone" | "children"> & {
  origin: TArticleOrigin;
};

/** Nhãn kiểm duyệt: bài AI (seed lúc deploy, chưa ai sửa) vs bài admin viết / đã sửa. */
export function ArticleOriginBadge({ origin, ...props }: TArticleOriginBadgeProps) {
  const isAi = origin === "AI";
  const Icon = isAi ? SparklesIcon : ShieldCheckIcon;
  return (
    <Badge tone={isAi ? "info" : "success"} {...props}>
      <Icon aria-hidden />
      {ARTICLE_ORIGIN_LABELS[origin]}
    </Badge>
  );
}
