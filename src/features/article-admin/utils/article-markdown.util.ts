/** Code block và inline code — ảnh / HTML trong code không tính (giống server). */
const CODE = /```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`/g;
const IMAGE_TARGET = /!\[[^\]]*\]\(([^)\s]+)[^)]*\)/g;

/** Đích của mọi ảnh trong thân bài (`![alt](<file>)`), ngoài code — mỗi đích phải có trong danh sách ảnh. */
export const listBodyImageTargets = (markdown: string): string[] =>
  [...markdown.replace(CODE, "").matchAll(IMAGE_TARGET)].map(([, target]) => target);

/**
 * Markdown như lưu (ảnh = tên file) → markdown để xem trước: đích ảnh có trong `urls` (file → URL) được thay bằng URL.
 * Chỉ đổi đích của cú pháp ảnh, ngoài code; ảnh chưa có URL giữ nguyên (renderer bỏ qua).
 */
export const resolvePreviewImages = (markdown: string, urls: ReadonlyMap<string, string>): string => {
  let result = "";
  let last = 0;
  for (const block of markdown.matchAll(CODE)) {
    result += replaceImageTargets(markdown.slice(last, block.index), urls) + block[0];
    last = block.index + block[0].length;
  }
  return result + replaceImageTargets(markdown.slice(last), urls);
};

const replaceImageTargets = (prose: string, urls: ReadonlyMap<string, string>) =>
  prose.replace(IMAGE_TARGET, (match: string, target: string) => {
    const url = urls.get(target);
    return url ? match.replace(`](${target}`, `](${url}`) : match;
  });
