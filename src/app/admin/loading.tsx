const BLOCK = "animate-pulse rounded-lg bg-muted";

/** Khung chờ phần nội dung — header / sidebar do layout /admin giữ nguyên. */
export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-4" role="status" aria-label="Đang tải">
      <div className={`${BLOCK} h-8 w-64`} />
      <div className={`${BLOCK} h-9 w-full sm:w-72`} />
      <div className={`${BLOCK} h-80 w-full`} />
    </div>
  );
}
