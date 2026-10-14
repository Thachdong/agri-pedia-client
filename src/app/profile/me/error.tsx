"use client";

import { useEffect } from "react";
import { Button } from "@/shared/components/atoms";
import { SiteHeader } from "@/shared/components/organisms";
import { ProfileLayout } from "@/shared/components/templates";

export default function MyProfileError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ProfileLayout
      // actions rỗng: lỗi render có thể nằm ở chính menu tài khoản.
      header={<SiteHeader actions={<></>} />}
      info={
        <div className="flex flex-col items-center gap-4 py-12 text-center" role="alert">
          <p className="text-sm text-muted-foreground">Không tải được hồ sơ của bạn. Vui lòng thử lại.</p>
          <Button type="button" onClick={() => retry()}>
            Thử lại
          </Button>
        </div>
      }
    />
  );
}
