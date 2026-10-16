import { CalendarIcon, ShieldAlertIcon, UserCheckIcon } from "lucide-react";
import { Badge } from "@/shared/components/atoms";
import { cn } from "@/shared/lib/utils";
import type { TArticleDetail, TArticleVerification } from "../types/article.types";

/** `reviewedBy` = "AI" → bài do AI biên soạn và tự kiểm tra (không có người duyệt). */
const AI_REVIEWER = "AI";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Ho_Chi_Minh",
});

export type TArticleMetaProps = Omit<React.ComponentProps<"div">, "children"> &
  Pick<TArticleDetail, "updatedAt" | "reviewedBy"> & {
    /** Mức xác minh của bệnh; null = bài không gắn bệnh (không hiện badge). */
    verification: TArticleVerification | null;
  };

/** Dòng meta dưới tiêu đề: ngày cập nhật · người duyệt · badge "Chưa được chuyên gia xác nhận" (≠ SOURCED). */
export function ArticleMeta({ updatedAt, reviewedBy, verification, className, ...props }: TArticleMetaProps) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground", className)}
      {...props}
    >
      <span className="inline-flex items-center gap-1">
        <CalendarIcon className="size-4" aria-hidden />
        Cập nhật <time dateTime={updatedAt}>{dateFormatter.format(new Date(updatedAt))}</time>
      </span>
      {reviewedBy && (
        <span className="inline-flex items-center gap-1">
          <UserCheckIcon className="size-4" aria-hidden />
          {reviewedBy === AI_REVIEWER ? "Nội dung do AI biên soạn và kiểm tra" : `Duyệt bởi ${reviewedBy}`}
        </span>
      )}
      {verification && verification !== "SOURCED" && (
        <Badge tone="warning">
          <ShieldAlertIcon aria-hidden />
          Chưa được chuyên gia xác nhận
        </Badge>
      )}
    </div>
  );
}
