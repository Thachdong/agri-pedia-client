"use client";

import { ScanSearchIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "@/features/auth";
import { Button } from "@/shared/components/atoms";
import { LoginRequiredDialog } from "@/shared/components/molecules";
import { ROUTES } from "@/shared/constants";
import { cn } from "@/shared/lib/utils";
import type { TArticleDetail } from "../types/article.types";

export type TArticleCtaButtonProps = {
  crop: Pick<TArticleDetail["crop"], "code" | "nameVi" | "diagnosisEnabled">;
  className?: string;
};

/**
 * Khối "Chẩn đoán bệnh bằng ảnh" (cuối bài, directive `::cta-diagnosis`, trang danh sách) — chỉ khi cây đã bật
 * chẩn đoán. Đã đăng nhập → form chẩn đoán của cây; guest → dialog mời đăng nhập. Phiên đọc ở client
 * (trang ISR không đọc cookie); đang tải → nút ở trạng thái loading, cùng kích thước.
 */
export function ArticleCtaButton({ crop, className }: TArticleCtaButtonProps) {
  const session = useSession();
  const [loginOpen, setLoginOpen] = useState(false);

  if (!crop.diagnosisEnabled) return null;

  const label = "Chẩn đoán bằng ảnh";
  return (
    <aside
      aria-label="Chẩn đoán bệnh bằng ảnh"
      className={cn(
        "card-normal not-prose flex flex-col gap-3 rounded-lg p-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <p className="font-medium text-foreground">Cây {crop.nameVi.toLowerCase()} của bạn có dấu hiệu lạ?</p>
        <p className="text-sm text-muted-foreground">Chụp ảnh lá, thân hoặc trái để AI gợi ý bệnh có thể gặp.</p>
      </div>
      {session.data?.signedIn ? (
        <Button asChild className="shrink-0">
          <Link href={ROUTES.diagnosis.new(crop.code)}>
            <ScanSearchIcon aria-hidden />
            {label}
          </Link>
        </Button>
      ) : (
        <>
          <Button
            className="shrink-0"
            loading={session.isPending}
            aria-haspopup="dialog"
            onClick={() => setLoginOpen(true)}
          >
            <ScanSearchIcon aria-hidden />
            {label}
          </Button>
          <LoginRequiredDialog
            open={loginOpen}
            onOpenChange={setLoginOpen}
            description="Đăng nhập để chẩn đoán bệnh cây trồng bằng ảnh"
          />
        </>
      )}
    </aside>
  );
}
