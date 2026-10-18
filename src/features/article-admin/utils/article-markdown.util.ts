/** Code block và inline code — ảnh / HTML trong code không tính (giống server). */
const CODE = /```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`/g;
const IMAGE_TARGET = /!\[[^\]]*\]\(([^)\s]+)[^)]*\)/g;

/** Đích của mọi ảnh trong thân bài (`![alt](<file>)`), ngoài code — mỗi đích phải có trong danh sách ảnh. */
export const listBodyImageTargets = (markdown: string): string[] =>
  [...markdown.replace(CODE, "").matchAll(IMAGE_TARGET)].map(([, target]) => target);

/** Link tới bài của 1 bệnh như lưu: `](/diseases/<CODE>` (link thường, không phải ảnh). */
const DISEASE_LINK = /(?<!!\[[^\]]*)\]\(\/diseases\/([A-Z0-9_]+)/g;

/** Áp `transform` lên phần văn bản ngoài code block / inline code, giữ nguyên code. */
const mapProse = (markdown: string, transform: (prose: string) => string): string => {
  let result = "";
  let last = 0;
  for (const block of markdown.matchAll(CODE)) {
    result += transform(markdown.slice(last, block.index)) + block[0];
    last = block.index + block[0].length;
  }
  return result + transform(markdown.slice(last));
};

/**
 * Markdown như lưu (ảnh = tên file) → markdown để xem trước: đích ảnh có trong `urls` (file → URL) được thay bằng URL.
 * Chỉ đổi đích của cú pháp ảnh, ngoài code; ảnh chưa có URL giữ nguyên (renderer bỏ qua).
 */
export const resolvePreviewImages = (markdown: string, urls: ReadonlyMap<string, string>): string =>
  mapProse(markdown, (prose) =>
    prose.replace(IMAGE_TARGET, (match: string, target: string) => {
      const url = urls.get(target);
      return url ? match.replace(`](${target}`, `](${url}`) : match;
    }),
  );

/**
 * Link `/diseases/<CODE>` → `toHref(CODE)` (ngoài code). Xem trước trong khu quản trị dùng để trỏ sang trang xem bài
 * trong admin — ADMIN không vào được trang public.
 */
export const resolvePreviewDiseaseLinks = (markdown: string, toHref: (code: string) => string): string =>
  mapProse(markdown, (prose) => prose.replace(DISEASE_LINK, (_match: string, code: string) => `](${toHref(code)}`));
