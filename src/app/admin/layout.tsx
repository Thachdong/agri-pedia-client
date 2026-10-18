import { BotIcon, FileTextIcon } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminArticleCropsQuery } from "@/features/article-admin";
import { AdminUserMenu, meQuery, type TUserProfile } from "@/features/user";
import { SidebarNav, type TSidebarNavGroup } from "@/shared/components/organisms";
import { AdminLayout } from "@/shared/components/templates";
import { ROUTES } from "@/shared/constants";
import { serverHttp } from "@/shared/lib/http/server";
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
    // admin-page.png (3) — tạm mock.
    id: "ai-provider",
    label: "AI Provider",
    icon: <BotIcon aria-hidden />,
    defaultOpen: false,
    items: [{ label: "Sắp ra mắt", href: `${ROUTES.admin.root}/ai-provider`, disabled: true }],
  },
];

/**
 * Khu quản trị (admin-page.png) — chỉ ADMIN. Proxy đã điều hướng theo cookie role; đây là kiểm tra thật
 * (role từ /users/me). Không lấy được hồ sơ → đăng nhập lại; role khác → trang chủ.
 */
export default async function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  const me = meQuery(serverHttp);
  const state = await prefetch([me, adminArticleCropsQuery(serverHttp)]);
  const profile = getPrefetchedData<TUserProfile>(state, me.queryKey);
  if (!profile) redirect(ROUTES.auth.login);
  if (profile.role !== "ADMIN") redirect(ROUTES.home);

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
