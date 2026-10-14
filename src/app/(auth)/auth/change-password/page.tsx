import type { Metadata } from "next";
import { AuthFooterLinks, AuthHeader, ChangePasswordForm } from "@/features/auth";
import { AuthLayout } from "@/shared/components/templates";

export const metadata: Metadata = {
  title: "Đặt mật khẩu mới | AgriPedia",
  description: "Nhập mã xác nhận đã gửi tới email/số điện thoại và đặt mật khẩu mới.",
};

/** Không prefetch: form chỉ đọc handoff (sessionStorage) ở client, không có dữ liệu server. */
export default function ChangePasswordPage() {
  return (
    <AuthLayout
      header={<AuthHeader />}
      title="Change Password"
      footer={<AuthFooterLinks links={["register", "login"]} />}
    >
      <ChangePasswordForm />
    </AuthLayout>
  );
}
