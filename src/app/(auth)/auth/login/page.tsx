import type { Metadata } from "next";
import { AuthFooterLinks, AuthHeader, LoginForm } from "@/features/auth";
import { AuthLayout } from "@/shared/components/templates";
import { LOGIN_NEXT_PARAM } from "@/shared/lib/auth/auth.constants";

export const metadata: Metadata = {
  title: "Đăng nhập | AgriPedia",
  description: "Đăng nhập AgriPedia bằng email hoặc số điện thoại.",
};

/** Không prefetch: không có dữ liệu server; `?next=` (do proxy / phiên hết hạn gắn vào) được LoginForm lọc trước khi chuyển trang. */
export default async function LoginPage({ searchParams }: PageProps<"/auth/login">) {
  const next = (await searchParams)[LOGIN_NEXT_PARAM];

  return (
    <AuthLayout
      header={<AuthHeader />}
      title="Login"
      footer={<AuthFooterLinks links={["register", "activate", "resetPassword"]} />}
    >
      <LoginForm next={typeof next === "string" ? next : undefined} />
    </AuthLayout>
  );
}
