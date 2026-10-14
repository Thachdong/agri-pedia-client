"use client";

import { useEffect } from "react";
import { Button } from "@/shared/components/atoms";
import { SiteHeader } from "@/shared/components/organisms";
import { ContentLayout } from "@/shared/components/templates";

export default function DiagnosisError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ContentLayout header={<SiteHeader actions={<></>} />}>
      <div className="flex flex-col items-center gap-4 py-12 text-center" role="alert">
        <p className="text-sm text-muted-foreground">Không tải được trang chẩn đoán. Vui lòng thử lại.</p>
        <Button type="button" onClick={() => retry()}>
          Thử lại
        </Button>
      </div>
    </ContentLayout>
  );
}
