import { ChevronDownIcon, ListIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { TArticleHeading } from "../utils/heading-ids.util";

export type TArticleTocProps = {
  headings: TArticleHeading[];
  className?: string;
};

/**
 * Mục lục từ các h2 của bài (deep link `#id`). Dùng `<details>` → không cần JS: mobile mặc định thu gọn,
 * desktop mở sẵn (CSS `open` không áp được nên dùng 2 khối: details cho mobile, nav thường cho `lg`).
 */
export function ArticleToc({ headings, className }: TArticleTocProps) {
  const items = headings.filter((heading) => heading.depth === 2);
  if (items.length < 2) return null;

  const list = (
    <ol className="flex flex-col gap-1.5 text-sm">
      {items.map((heading, index) => (
        <li key={heading.id} className="flex gap-2">
          <span className="text-muted-foreground tabular-nums">{index + 1}.</span>
          <a
            href={`#${heading.id}`}
            className="rounded-sm text-foreground underline-offset-4 outline-none hover:text-link hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <nav aria-label="Mục lục" className={cn("card-normal rounded-lg", className)}>
      <details className="group lg:hidden">
        <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-4 py-3 font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
          <ListIcon className="size-4" aria-hidden />
          Mục lục
          <ChevronDownIcon className="ml-auto size-4 transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <div className="px-4 pb-4">{list}</div>
      </details>
      <div className="hidden flex-col gap-3 p-4 lg:flex">
        <p className="flex items-center gap-2 font-medium">
          <ListIcon className="size-4" aria-hidden />
          Mục lục
        </p>
        {list}
      </div>
    </nav>
  );
}
