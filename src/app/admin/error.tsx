"use client";

import { useEffect } from "react";
import { Button } from "@/shared/components/atoms";

export default function AdminError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center" role="alert">
      <p className="text-sm text-muted-foreground">Không tải được trang quản trị. Vui lòng thử lại.</p>
      <Button type="button" onClick={() => retry()}>
        Thử lại
      </Button>
    </div>
  );
}
