import { FilePenLineIcon } from "lucide-react";
import { Callout } from "@/shared/components/molecules";

export type TDraftBannerProps = { className?: string };

/** Bài `DRAFT`: vẫn hiển thị (noindex) nhưng báo người đọc nội dung chưa duyệt xong. */
export function DraftBanner({ className }: TDraftBannerProps) {
  return (
    <Callout tone="warning" icon={FilePenLineIcon} title="Bản nháp" className={className}>
      Nội dung đang được kiểm tra, có thể thay đổi.
    </Callout>
  );
}
