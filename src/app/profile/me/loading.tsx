import { SiteHeader } from "@/shared/components/organisms";
import { ProfileLayout } from "@/shared/components/templates";

const BLOCK = "animate-pulse rounded-lg bg-muted";
const ROW_COUNT = 3;

export default function MyProfileLoading() {
  return (
    <ProfileLayout
      header={<SiteHeader actions={<div className={`${BLOCK} h-8 w-32`} aria-hidden />} />}
      info={
        <div className="flex flex-col gap-4" role="status" aria-label="Đang tải">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="size-10 animate-pulse rounded-full bg-muted" />
              <div className={`${BLOCK} h-6 w-48`} />
            </div>
            <div className={`${BLOCK} h-9 w-28`} />
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
    />
  );
}
