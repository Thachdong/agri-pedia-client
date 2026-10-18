/** Code block và inline code — ảnh / HTML trong code không tính (giống server). */
const CODE = /```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`/g;
const IMAGE_TARGET = /!\[[^\]]*\]\(([^)\s]+)[^)]*\)/g;

/** Đích của mọi ảnh trong thân bài (`![alt](<file>)`), ngoài code — mỗi đích phải có trong danh sách ảnh. */
export const listBodyImageTargets = (markdown: string): string[] =>
  [...markdown.replace(CODE, "").matchAll(IMAGE_TARGET)].map(([, target]) => target);
