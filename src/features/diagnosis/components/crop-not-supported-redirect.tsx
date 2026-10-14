"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ROUTES } from "@/shared/constants";
import { toast } from "@/shared/lib/toast";

/** `crop` thiếu / không được hỗ trợ ở /diagnosis/new → báo và về trang chủ (page server không toast được). */
export function CropNotSupportedRedirect() {
  const router = useRouter();
  useEffect(() => {
    toast.error("Cây trồng chưa được hỗ trợ chẩn đoán");
    router.replace(ROUTES.home);
  }, [router]);
  return null;
}
