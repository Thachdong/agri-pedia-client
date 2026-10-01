import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ChatRoomsMenu } from "@/features/chat";
import {
  DistributorProfileActions,
  DistributorProfileInfo,
  DistributorProfileTabs,
  distributorProfileQuery,
  type TDistributorProfile,
} from "@/features/distributor";
import { NotificationMenu } from "@/features/notification";
import { distributorProductsQuery } from "@/features/product";
import { distributorReviewsQuery } from "@/features/review";
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
 * Tabs: trang đầu sản phẩm + đánh giá shop (public, cùng vòng) — lỗi thì tab tự tải lại trên client.
 */
const loadProfilePage = cache(async (id: string) => {
  const signedIn = await hasSession();
  const profileQuery = distributorProfileQuery(id, serverHttp);
  const me = meQuery(serverHttp);

  let state;
  try {
    state = await prefetch(signedIn ? [me] : [], {
      required: [profileQuery],
      infinite: [distributorProductsQuery(id, serverHttp), distributorReviewsQuery({ distributorId: id }, serverHttp)],
    });
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

  // Chỉ truyền id + role xuống client (đủ cho owner / FARMER), không cả profile.
  const viewerSummary = viewer && { id: viewer.id, role: viewer.role };

  return { state, ownerState, profile, signedIn, isOwner, viewer: viewerSummary };
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
 * guest → không nút; FARMER → Chat + Đánh giá; owner → Chỉnh sửa.
 * Tabs Sản phẩm | Đánh giá: mọi người xem; FARMER đánh giá sản phẩm; owner thêm / sửa / xoá sản phẩm.
 */
export default async function ProfilePage({ params }: PageProps<"/profile/[id]">) {
  const { id } = await params;
  const { state, ownerState, signedIn, isOwner, viewer } = await loadProfilePage(id);

  if (!signedIn) {
    return (
      <HydrateQueries state={state}>
        <ProfileLayout
          header={<SiteHeader />}
          info={<DistributorProfileInfo distributorId={id} />}
          tabs={<DistributorProfileTabs distributorId={id} />}
        />
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
        tabs={<DistributorProfileTabs distributorId={id} viewer={viewer} />}
      />
    </RealtimeProvider>
  );

  return (
    <HydrateQueries state={state}>
      {ownerState ? <HydrateQueries state={ownerState}>{content}</HydrateQueries> : content}
    </HydrateQueries>
  );
}
