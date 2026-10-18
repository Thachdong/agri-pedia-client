import type { TArticleFormValues } from "../types/article-admin.types";

export type TArticleIssueField = keyof Pick<TArticleFormValues, "title" | "summary" | "markdown" | "images" | "cover">;
export type TArticleIssue = { field: TArticleIssueField; message: string };

/**
 * `details.issues` của KNOWLEDGE_ARTICLE_INVALID_CONTENT (câu tiếng Anh, thứ tự cố định — xem article-content-rules.ts
 * của server) → field của form + thông báo tiếng Việt. Câu không nhận ra → gắn vào nội dung, giữ nguyên văn.
 */
const ISSUE_RULES: { pattern: RegExp; field: TArticleIssueField; message: (match: RegExpMatchArray) => string }[] = [
  { pattern: /^title must be 1-(\d+)/, field: "title", message: ([, max]) => `Tiêu đề 1-${max} ký tự` },
  { pattern: /^summary must be (\d+)-(\d+)/, field: "summary", message: ([, min, max]) => `Tóm tắt ${min}-${max} ký tự` },
  { pattern: /^image file (\S+) must match/, field: "images", message: ([, file]) => `Tên file ảnh "${file}" không hợp lệ` },
  { pattern: /^image file (\S+) is listed twice/, field: "images", message: ([, file]) => `Ảnh "${file}" bị trùng` },
  { pattern: /^cover (\S*) is not listed/, field: "cover", message: () => "Chọn ảnh bìa trong danh sách ảnh" },
  { pattern: /^image (\S+) is not listed/, field: "markdown", message: ([, file]) => `Ảnh "${file}" chưa có trong danh sách ảnh` },
  {
    pattern: /^disease (\S+) is not in the (\S+) KB/,
    field: "markdown",
    message: ([, code]) => `Mã bệnh "${code}" không thuộc cây này`,
  },
  {
    pattern: /^disease-card (\S+) must be a disease id/,
    field: "markdown",
    message: ([, code]) => `::disease-card chỉ nhận mã bệnh, "${code}" là variant`,
  },
  { pattern: /^HTML tags are not allowed/, field: "markdown", message: () => "Không được dùng thẻ HTML" },
];

export const mapArticleContentIssues = (details: unknown): TArticleIssue[] => {
  const issues = (details as { issues?: unknown } | null)?.issues;
  if (!Array.isArray(issues)) return [];
  return issues
    .filter((issue): issue is string => typeof issue === "string")
    .map((issue) => {
      for (const rule of ISSUE_RULES) {
        const match = issue.match(rule.pattern);
        if (match) return { field: rule.field, message: rule.message(match) };
      }
      return { field: "markdown" as const, message: issue };
    });
};

/** Gộp các issue cùng field thành 1 thông báo (form chỉ hiện 1 lỗi mỗi field). */
export const groupArticleIssues = (issues: TArticleIssue[]): Map<TArticleIssueField, string> => {
  const grouped = new Map<TArticleIssueField, string[]>();
  issues.forEach(({ field, message }) => grouped.set(field, [...(grouped.get(field) ?? []), message]));
  return new Map([...grouped].map(([field, messages]) => [field, messages.join(" · ")]));
};
