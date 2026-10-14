import type { Metadata } from "next";
import { AuthFooterLinks, AuthHeader, ResetPasswordForm } from "@/features/auth";
import { AuthLayout } from "@/shared/components/templates";

export const metadata: Metadata = {
  title: "Quên mật khẩu | AgriPedia",
  description: "Nhập email/số điện thoại đã đăng ký để nhận mã đặt lại mật khẩu.",
};

/** Không prefetch: form không có dữ liệu server. */
export default function ResetPasswordPage() {
  return (
    <AuthLayout
      header={<AuthHeader />}
      title="Reset Password"
      footer={<AuthFooterLinks links={["register", "login", "activate"]} />}
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}
