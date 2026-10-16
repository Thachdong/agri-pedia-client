import { SiteHeader } from "@/shared/components/organisms";
import { ContentLayout } from "@/shared/components/templates";

const BLOCK = "animate-pulse rounded-lg bg-muted";

export default function DiseaseLoading() {
  return (
    <ContentLayout header={<SiteHeader actions={<div className={`${BLOCK} h-8 w-32`} aria-hidden />} />}>
      <div className="flex flex-col gap-4" role="status" aria-label="Đang tải">
        <div className={`${BLOCK} h-8 w-2/3`} />
        <div className={`${BLOCK} h-4 w-1/2`} />
        <div className={`${BLOCK} h-48 w-full`} />
        <div className={`${BLOCK} h-32 w-full`} />
      </div>
    </ContentLayout>
  );
}
