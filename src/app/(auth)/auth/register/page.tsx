import type { Metadata } from "next";
import { AuthFooterLinks, AuthHeader, RegisterForm } from "@/features/auth";
import { provincesQuery } from "@/features/location";
import { AuthLayout } from "@/shared/components/templates";
import { serverHttp } from "@/shared/lib/http/server";
import { HydrateQueries, prefetch } from "@/shared/lib/query/server";

export const metadata: Metadata = {
  title: "Đăng ký tài khoản | AgriPedia",
  description: "Tạo tài khoản AgriPedia cho nông dân hoặc nhà phân phối.",
};

export default async function RegisterPage() {
  // Lỗi prefetch không chặn trang — client tự fetch lại khi mở select tỉnh/thành.
  const state = await prefetch([provincesQuery(serverHttp)]);

  return (
    <HydrateQueries state={state}>
      <AuthLayout
        header={<AuthHeader />}
        title="Register"
        footer={<AuthFooterLinks links={["login", "activate", "resetPassword"]} />}
      >
        <RegisterForm />
      </AuthLayout>
    </HydrateQueries>
  );
}
