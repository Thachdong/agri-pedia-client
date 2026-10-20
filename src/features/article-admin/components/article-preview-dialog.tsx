"use client";

import { EyeIcon } from "lucide-react";
import { useState } from "react";
import { ArticleOriginBadge } from "@/features/article";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/atoms";
import type { TAppForm } from "@/shared/lib/form";
import type { TArticleFormValues } from "../types/article-admin.types";
import type { TArticlePreviewCrop } from "../utils/article-preview.util";
import { ArticlePreviewBody } from "./article-preview-body";

export type TArticlePreviewDialogProps = {
  form: TAppForm<TArticleFormValues>;
  crop: TArticlePreviewCrop;
  disabled?: boolean;
};

/** Nút "Xem trước" ở form viết / sửa bài — mở toàn bài như trang public từ giá trị đang nhập (chưa lưu). */
export function ArticlePreviewDialog({ form, crop, disabled }: TArticlePreviewDialogProps) {
  // Chụp giá trị lúc mở — dialog không theo từng phím gõ.
  const [values, setValues] = useState<TArticleFormValues | null>(null);

  return (
    <Dialog open={values !== null} onOpenChange={(open) => setValues(open ? form.getValues() : null)}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" disabled={disabled}>
          <EyeIcon aria-hidden />
          Xem trước
        </Button>
      </DialogTrigger>
      <DialogContent className="scrollbar-thin max-h-[90dvh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Xem trước bài viết</DialogTitle>
          <DialogDescription>Bài hiển thị như trang public — nội dung chưa được lưu.</DialogDescription>
        </DialogHeader>
        {values && (
          <ArticlePreviewBody
            values={values}
            crop={crop}
            badges={
              <>
                <ArticleOriginBadge origin="ADMIN" />
                <Badge tone="warning">Chưa lưu</Badge>
              </>
            }
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
