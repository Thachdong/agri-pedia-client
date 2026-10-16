import { SiteHeader } from "@/shared/components/organisms";
import { ContentLayout } from "@/shared/components/templates";

const BLOCK = "animate-pulse rounded-lg bg-muted";

export default function DiagnosisLoading() {
  return (
    <ContentLayout header={<SiteHeader actions={<div className={`${BLOCK} h-8 w-32`} aria-hidden />} />}>
      <div className="flex flex-col gap-6" role="status" aria-label="Đang tải">
        <div className={`${BLOCK} h-8 w-2/3`} />
        <div className={`${BLOCK} h-24 w-full`} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className={`${BLOCK} aspect-square w-full`} />
          ))}
        </div>
      </div>
    </ContentLayout>
  );
}
