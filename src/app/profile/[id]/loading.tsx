import { SiteHeader } from "@/shared/components/organisms";
import { ProfileLayout } from "@/shared/components/templates";

const BLOCK = "animate-pulse rounded-lg bg-muted";
const ROW_COUNT = 5;
const CARD_COUNT = 3;

export default function ProfileLoading() {
  return (
    <ProfileLayout
      // Chưa biết guest hay đã đăng nhập → khung trung tính, không hiện Login/Register.
      header={<SiteHeader actions={<div className={`${BLOCK} h-8 w-32`} aria-hidden />} />}
      info={
        <div className="flex flex-col gap-4" role="status" aria-label="Đang tải">
          <div className="flex items-center gap-3">
            <div className="size-10 animate-pulse rounded-full bg-muted" />
            <div className={`${BLOCK} h-6 w-48`} />
          </div>
          <div className="divide-y divide-border-subtle rounded-lg border border-border-subtle">
            {Array.from({ length: ROW_COUNT }, (_, index) => (
              <div key={index} className="grid grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-[minmax(10rem,1fr)_2fr]">
                <div className={`${BLOCK} h-4 w-28`} />
                <div className={`${BLOCK} h-4 w-3/4`} />
              </div>
            ))}
          </div>
        </div>
      }
      tabs={
        <div className="flex flex-col gap-6" aria-hidden>
          <div className={`${BLOCK} h-11 w-full`} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: CARD_COUNT }, (_, index) => (
              <div key={index} className={`${BLOCK} aspect-4/3 w-full`} />
            ))}
          </div>
        </div>
      }
    />
  );
}
