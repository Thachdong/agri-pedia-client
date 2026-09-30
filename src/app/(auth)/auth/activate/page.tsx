import type { Metadata } from "next";
import { ActivateForm, AuthFooterLinks, AuthHeader } from "@/features/auth";
import { AuthLayout } from "@/shared/components/templates";

export const metadata: Metadata = {
  title: "Kích hoạt tài khoản | AgriPedia",
  description: "Nhập mã kích hoạt đã gửi tới email/số điện thoại để kích hoạt tài khoản nhà phân phối.",
};

/** Không prefetch: form chỉ đọc handoff (sessionStorage) ở client, không có dữ liệu server. */
export default function ActivatePage() {
  return (
    <AuthLayout
      header={<AuthHeader />}
      title="Activate Account"
      footer={<AuthFooterLinks links={["register", "login", "resetPassword"]} />}
    >
      <ActivateForm />
    </AuthLayout>
  );
}
