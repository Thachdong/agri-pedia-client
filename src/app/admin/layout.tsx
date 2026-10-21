import { BotIcon, FileTextIcon, SettingsIcon } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminArticleCropsQuery } from "@/features/article-admin";
import { AdminUserMenu, meQuery, type TUserProfile } from "@/features/user";
import { SidebarNav, type TSidebarNavGroup } from "@/shared/components/organisms";
import { AdminLayout } from "@/shared/components/templates";
import { ROUTES } from "@/shared/constants";
import { isAppError } from "@/shared/lib/http";
import { serverHttp } from "@/shared/lib/http/server";
import { REFRESH_NEXT_PARAM, REFRESH_PATH } from "@/shared/lib/auth/auth.constants";
import { getPrefetchedData, HydrateQueries, prefetch } from "@/shared/lib/query/server";

export const metadata: Metadata = {
  title: { default: "Quản trị", template: "%s | AgriPedia Admin" },
  robots: { index: false, follow: false },
};

const SIDEBAR_GROUPS: TSidebarNavGroup[] = [
  {
    id: "article",
    label: "Article",
    icon: <FileTextIcon aria-hidden />,
    items: [
      { label: "List", href: ROUTES.admin.articles.list() },
      { label: "Create", href: ROUTES.admin.articles.new() },
    ],
  },
  {
    // Specs/19102026/admin.md — cài đặt nền tảng (bỏ menu / banner).
    id: "settings",
    label: "Cài đặt",
    icon: <SettingsIcon aria-hidden />,
    items: [
      { label: "Chẩn đoán", href: ROUTES.admin.settings.diagnosis },
      { label: "Bài viết nổi bật", href: ROUTES.admin.settings.topArticles() },
    ],
  },
  {
    // admin-page.png (3) — AI model của từng tính năng.
    id: "ai-provider",
    label: "AI Provider",
    icon: <BotIcon aria-hidden />,
    items: [
      { label: "Chẩn đoán bệnh", href: ROUTES.admin.aiProvider.diagnosis },
      { label: "Tạo sản phẩm", href: ROUTES.admin.aiProvider.productSuggestion },
    ],
  },
];

/**
 * Khu quản trị (admin-page.png) — chỉ ADMIN. Proxy đã điều hướng theo cookie role (và làm mới token hết hạn);
 * đây là kiểm tra thật (role từ /users/me): 401 → làm mới phiên, role khác → trang chủ, lỗi khác → error.tsx.
 */
export default async function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  const me = meQuery(serverHttp);
  let state;
  try {
    state = await prefetch([adminArticleCropsQuery(serverHttp)], { required: [me] });
  } catch (error) {
    // Token bị từ chối (proxy đã làm mới nếu hết hạn) → làm mới lần nữa; hỏng thì route refresh xoá phiên → login.
    // KHÔNG redirect thẳng login: còn cookie phiên thì proxy đẩy ADMIN ngược về đây (vòng lặp).
    if (isAppError(error) && error.status === 401) {
      redirect(`${REFRESH_PATH}?${REFRESH_NEXT_PARAM}=${encodeURIComponent(ROUTES.admin.articles.list())}`);
    }
    throw error;
  }
  const profile = getPrefetchedData<TUserProfile>(state, me.queryKey);
  if (profile?.role !== "ADMIN") redirect(ROUTES.home);

  return (
    <HydrateQueries state={state}>
      <AdminLayout
        homeHref={ROUTES.admin.articles.list()}
        sidebar={<SidebarNav groups={SIDEBAR_GROUPS} />}
        actions={<AdminUserMenu />}
      >
        {children}
      </AdminLayout>
    </HydrateQueries>
  );
}
