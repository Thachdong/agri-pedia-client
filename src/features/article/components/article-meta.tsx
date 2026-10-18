import { CalendarIcon, ShieldAlertIcon } from "lucide-react";
import { Badge } from "@/shared/components/atoms";
import { cn } from "@/shared/lib/utils";
import type { TArticleDetail, TArticleVerification } from "../types/article.types";
import { ArticleOriginBadge } from "./article-origin-badge";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Ho_Chi_Minh",
});

export type TArticleMetaProps = Omit<React.ComponentProps<"div">, "children"> &
  Pick<TArticleDetail, "updatedAt" | "origin"> & {
    /** Mức xác minh của bệnh; null = bài không gắn bệnh (không hiện badge). */
    verification: TArticleVerification | null;
  };

/** Dòng meta dưới tiêu đề: ngày cập nhật · nhãn kiểm duyệt (AI / Admin) · badge "Chưa được chuyên gia xác nhận" (≠ SOURCED). */
export function ArticleMeta({ updatedAt, origin, verification, className, ...props }: TArticleMetaProps) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground", className)}
      {...props}
    >
      <span className="inline-flex items-center gap-1">
        <CalendarIcon className="size-4" aria-hidden />
        Cập nhật <time dateTime={updatedAt}>{dateFormatter.format(new Date(updatedAt))}</time>
      </span>
      <ArticleOriginBadge origin={origin} />
      {verification && verification !== "SOURCED" && (
        <Badge tone="warning">
          <ShieldAlertIcon aria-hidden />
          Chưa được chuyên gia xác nhận
        </Badge>
      )}
    </div>
  );
}
