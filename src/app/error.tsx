"use client";

import { useEffect } from "react";
import { Button } from "@/shared/components/atoms";
import { SiteHeader } from "@/shared/components/organisms";
import { MapListLayout } from "@/shared/components/templates";

export default function HomeError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const message = (
    <div className="flex flex-col items-center gap-4 py-6 text-center" role="alert">
      <p className="text-sm text-muted-foreground">Không tải được trang. Vui lòng thử lại.</p>
      <Button type="button" onClick={() => retry()}>
        Thử lại
      </Button>
    </div>
  );

  return <MapListLayout header={<SiteHeader />} map={<div className="size-full bg-muted" />} list={message} />;
}
