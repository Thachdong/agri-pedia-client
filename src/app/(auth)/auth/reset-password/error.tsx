"use client";

import { useEffect } from "react";
import { AuthHeader } from "@/features/auth";
import { Button } from "@/shared/components/atoms";
import { AuthLayout } from "@/shared/components/templates";

export default function ResetPasswordError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <AuthLayout header={<AuthHeader />} title="Reset Password">
      <div className="flex flex-col items-center gap-4 py-6 text-center" role="alert">
        <p className="text-sm text-muted-foreground">Không tải được trang reset mật khẩu. Vui lòng thử lại.</p>
        <Button type="button" onClick={() => retry()}>
          Thử lại
        </Button>
      </div>
    </AuthLayout>
  );
}
