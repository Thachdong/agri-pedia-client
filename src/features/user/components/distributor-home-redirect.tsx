"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ROUTES } from "@/shared/constants";
import { useMe } from "../hooks/use-me";

/**
 * DISTRIBUTOR không dùng trang "/" → chuyển về profile của mình.
 * Dự phòng cho khi server chưa đọc được /users/me (access token hết hạn — chỉ BFF refresh được);
 * bình thường page đã redirect trên server.
 */
export function DistributorHomeRedirect() {
  const { data: me } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (me?.role === "DISTRIBUTOR") router.replace(ROUTES.profile(me.id));
  }, [me, router]);

  return null;
}
