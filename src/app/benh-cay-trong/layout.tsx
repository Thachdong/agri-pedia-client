import { SessionHeaderActions } from "@/features/auth";
import { ChatRoomsMenu } from "@/features/chat";
import { StartDiagnosisButton } from "@/features/diagnosis";
import { NotificationMenu } from "@/features/notification";
import { AdminUserMenu, UserMenu } from "@/features/user";
import { GuestActions, SiteHeader } from "@/shared/components/organisms";
import { ContentLayout } from "@/shared/components/templates";
import { RealtimeProvider } from "@/shared/lib/realtime";

/**
 * Khung chung của /benh-cay-trong/* (public, ISR): KHÔNG đọc cookies() / headers() ở bất kỳ đâu trong cây server
 * của các route này — phiên đọc ở client qua SessionHeaderActions. ADMIN: chỉ user menu (không chat / thông báo).
 */
export default function ArticlesLayout({ children }: LayoutProps<"/benh-cay-trong">) {
  return (
    <ContentLayout
      width="lg"
      header={
        <SiteHeader
          actions={
            <SessionHeaderActions
              signedIn={
                <RealtimeProvider>
                  <StartDiagnosisButton compact />
                  <NotificationMenu />
                  <ChatRoomsMenu />
                  <UserMenu />
                </RealtimeProvider>
              }
              admin={<AdminUserMenu showAdminLink />}
              guest={
                <>
                  <StartDiagnosisButton compact signedIn={false} />
                  <GuestActions />
                </>
              }
            />
          }
        />
      }
    >
      {children}
    </ContentLayout>
  );
}
