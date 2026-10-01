import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ChatRoomsMenu } from "@/features/chat";
import {
  DistributorProfileActions,
  DistributorProfileInfo,
  distributorProfileQuery,
  type TDistributorProfile,
} from "@/features/distributor";
import { NotificationMenu } from "@/features/notification";
import { meQuery, myAddressesQuery, type TUserProfile, UserMenu } from "@/features/user";
import { SiteHeader } from "@/shared/components/organisms";
import { ProfileLayout } from "@/shared/components/templates";
import { BUSINESS_TYPE_LABELS } from "@/shared/constants";
import { hasSession } from "@/shared/lib/auth";
import { isAppError } from "@/shared/lib/http";
import { serverHttp } from "@/shared/lib/http/server";
import { getPrefetchedData, HydrateQueries, prefetch } from "@/shared/lib/query/server";
import { RealtimeProvider } from "@/shared/lib/realtime";

/**
 * Dữ liệu trang — `cache` để generateMetadata và page dùng chung 1 lần gọi NestJS mỗi request.
 * Guest không gọi /users/me. Profile là query bắt buộc: 404 (id lạ / không phải distributor ACTIVE) hoặc 400 (id sai dạng) → notFound().
 */
const loadProfilePage = cache(async (id: string) => {
  const signedIn = await hasSession();
  const profileQuery = distributorProfileQuery(id, serverHttp);
  const me = meQuery(serverHttp);

  let state;
  try {
    state = await prefetch(signedIn ? [me] : [], { required: [profileQuery] });
  } catch (error) {
    if (isAppError(error) && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }

  const profile = getPrefetchedData<TDistributorProfile>(state, profileQuery.queryKey);
  if (!profile) notFound();
  const viewer = signedIn ? getPrefetchedData<TUserProfile>(state, me.queryKey) : undefined;
  const isOwner = viewer?.id === id;
  // Owner: danh sách address đầy đủ (cần biết owner trước → vòng prefetch thứ 2).
  const ownerState = isOwner ? await prefetch([myAddressesQuery(serverHttp)]) : null;

  return { state, ownerState, profile, signedIn, isOwner };
});

export async function generateMetadata({ params }: PageProps<"/profile/[id]">): Promise<Metadata> {
  const { id } = await params;
  const { profile } = await loadProfilePage(id);
  const businessType = profile.bussinessType ? BUSINESS_TYPE_LABELS[profile.bussinessType] : "Nhà phân phối";
  return {
    title: `${profile.username} | AgriPedia`,
    description: profile.bio?.slice(0, 160) || `${profile.username} — ${businessType} trên AgriPedia.`,
  };
}

/**
 * Public (ui-ux.md §7). Phần thông tin distributor + nút theo người xem:
 * guest → không nút; FARMER → Chat + Đánh giá; owner → Chỉnh sửa. Tabs Sản phẩm / Đánh giá: làm sau.
 */
export default async function ProfilePage({ params }: PageProps<"/profile/[id]">) {
  const { id } = await params;
  const { state, ownerState, signedIn, isOwner } = await loadProfilePage(id);

  if (!signedIn) {
    return (
      <HydrateQueries state={state}>
        <ProfileLayout header={<SiteHeader />} info={<DistributorProfileInfo distributorId={id} />} />
      </HydrateQueries>
    );
  }

  const content = (
    <RealtimeProvider>
      <ProfileLayout
        header={
          <SiteHeader
            actions={
              <>
                <NotificationMenu />
                <ChatRoomsMenu />
                <UserMenu />
              </>
            }
          />
        }
        info={
          <DistributorProfileInfo
            distributorId={id}
            isOwner={isOwner}
            actions={<DistributorProfileActions distributorId={id} />}
          />
        }
      />
    </RealtimeProvider>
  );

  return (
    <HydrateQueries state={state}>
      {ownerState ? <HydrateQueries state={ownerState}>{content}</HydrateQueries> : content}
    </HydrateQueries>
  );
}
