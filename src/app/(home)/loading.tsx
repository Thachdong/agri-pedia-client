import { SiteHeader } from "@/shared/components/organisms";
import { HomeLayout } from "@/shared/components/templates";

const BLOCK = "animate-pulse rounded-lg bg-muted";

export default function HomeLoading() {
  return (
    <HomeLayout
      // Chưa biết guest hay đã đăng nhập → khung trung tính, không hiện Login/Register.
      header={<SiteHeader actions={<div className={`${BLOCK} h-8 w-32`} aria-hidden />} />}
      mapTitle={<span className={`${BLOCK} block h-6 w-40`} aria-hidden />}
      map={<div className="size-full animate-pulse bg-muted" />}
      list={
        <div className="flex flex-col gap-2" aria-hidden>
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className={`${BLOCK} h-16 w-full`} />
          ))}
        </div>
      }
    >
      <div role="status" aria-label="Đang tải" className="card-normal flex flex-col gap-4 rounded-xl p-4 sm:p-6">
        <div className={`${BLOCK} h-6 w-64`} />
        <div className={`${BLOCK} h-9 w-56`} />
        <div className={`${BLOCK} h-16 w-full`} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <div className={`${BLOCK} aspect-square`} />
        </div>
      </div>
      <div className="flex flex-col gap-3" aria-hidden>
        <div className={`${BLOCK} h-6 w-48`} />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className={`${BLOCK} h-64 w-72 shrink-0`} />
          ))}
        </div>
      </div>
    </HomeLayout>
  );
}
