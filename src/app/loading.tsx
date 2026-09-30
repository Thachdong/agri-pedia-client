import { SiteHeader } from "@/shared/components/organisms";
import { MapListLayout } from "@/shared/components/templates";

const BLOCK = "animate-pulse rounded-lg bg-muted";

export default function HomeLoading() {
  return (
    <MapListLayout
      header={<SiteHeader />}
      map={<div className="size-full animate-pulse bg-muted" />}
      list={
        <div className="flex flex-col gap-2" role="status" aria-label="Đang tải">
          <div className={`${BLOCK} h-4 w-40`} />
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className={`${BLOCK} h-16 w-full`} />
          ))}
        </div>
      }
    />
  );
}
