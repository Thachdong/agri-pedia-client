import { ArticleOriginBadge, type TArticleOrigin } from "@/features/article";
import { cn } from "@/shared/lib/utils";

export type TArticleEditorHeaderProps = {
  className?: string;
} & (
  | { mode: "create"; /** Tên bệnh / variant. */ name: string; code: string; cropName: string }
  | { mode: "update"; title: string; code: string; origin: TArticleOrigin }
);

/** Tiêu đề trang viết / sửa bài — nói rõ bài sẽ được đánh dấu "kiểm duyệt bởi Admin" sau khi lưu. */
export function ArticleEditorHeader(props: TArticleEditorHeaderProps) {
  if (props.mode === "create") {
    return (
      <header className={cn("flex flex-col gap-1", props.className)}>
        <h1 className="text-xl font-semibold">Viết bài: {props.name}</h1>
        <p className="text-sm text-muted-foreground">
          <code>{props.code}</code> · {props.cropName} — bài được publish ngay, đánh dấu “Nội dung được kiểm duyệt bởi
          Admin”.
        </p>
      </header>
    );
  }

  return (
    <header className={cn("flex flex-col gap-2", props.className)}>
      <div className="flex flex-wrap items-center gap-2">
        <ArticleOriginBadge origin={props.origin} />
        <code className="text-xs text-muted-foreground">{props.code}</code>
      </div>
      <h1 className="text-xl font-semibold">Sửa bài: {props.title}</h1>
      {props.origin === "AI" && (
        <p className="text-sm text-muted-foreground">
          Bài do AI tạo — sau khi lưu sẽ được đánh dấu “Nội dung được kiểm duyệt bởi Admin” và không bị seed ghi đè.
        </p>
      )}
    </header>
  );
}
