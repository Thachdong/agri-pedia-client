import { removeDiacritics } from "@/shared/utils";
import { ARTICLE_SLUG_MAX } from "../constants/article-admin.constants";
import type {
  TAdminArticleDetail,
  TAdminArticleTarget,
  TAdminArticleTargetsResponse,
  TArticleFormValues,
  TArticleImageFormValue,
  TArticleImageInput,
  TCreateArticleInput,
  TUpdateArticleInput,
} from "../types/article-admin.types";

/** Slug gợi ý từ tên bệnh: "Bệnh đạo ôn lá" → "benh-dao-on-la" (admin sửa được trước khi tạo). */
export const suggestArticleSlug = (name: string): string =>
  removeDiacritics(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, ARTICLE_SLUG_MAX)
    .replace(/-+$/, "");

/** Tên file webp gợi ý cho ảnh mới, theo tên file gốc ("Lá Bệnh 01.JPG" → "la-benh-01.webp"), không trùng `taken`. */
export const suggestImageFile = (originalName: string, taken: ReadonlySet<string>): string => {
  const base = suggestArticleSlug(originalName.replace(/\.[^.]*$/, "")) || "anh";
  let file = `${base}.webp`;
  for (let index = 2; taken.has(file); index += 1) file = `${base}-${index}.webp`;
  return file;
};

/** Form trống để viết bài mới. */
export const emptyArticleFormValues = (slug = ""): TArticleFormValues => ({
  slug,
  title: "",
  summary: "",
  markdown: "",
  cover: "",
  images: [],
  sources: [],
});

/** Bài đang lưu → giá trị form sửa (ảnh đã lưu: `upload` null, xem trước bằng URL public). */
export const toArticleFormValues = (article: TAdminArticleDetail): TArticleFormValues => ({
  slug: article.slug,
  title: article.title,
  summary: article.summary,
  markdown: article.markdown,
  cover: article.cover ?? "",
  images: article.images.map(({ file, url, alt, caption, credit }) => ({
    file,
    alt,
    caption: caption ?? "",
    credit,
    previewUrl: url,
    upload: null,
  })),
  sources: article.sources,
});

/** Ảnh form → ảnh request: ảnh mới gửi `tmpKey`; caption rỗng → null. */
const toImageInput = ({ file, alt, caption, credit, upload }: TArticleImageFormValue): TArticleImageInput => ({
  file,
  alt,
  caption: caption || null,
  credit,
  ...(upload?.status === "done" && { tmpKey: upload.media.key }),
});

const toContentInput = ({ title, summary, markdown, cover, images, sources }: TArticleFormValues): TUpdateArticleInput => ({
  title,
  summary,
  markdown,
  cover,
  images: images.map(toImageInput),
  sources,
});

/** PUT /admin/knowledge/articles/:code — slug không gửi (không đổi được). */
export const toUpdateArticleInput = (values: TArticleFormValues): TUpdateArticleInput => toContentInput(values);

/** POST /admin/knowledge/articles. */
export const toCreateArticleInput = (code: string, values: TArticleFormValues): TCreateArticleInput => ({
  code,
  slug: values.slug,
  ...toContentInput(values),
});

/** Bệnh / variant `code` trong danh sách của 1 cây; không có → undefined. */
export const findArticleTarget = (
  response: TAdminArticleTargetsResponse | undefined,
  code: string,
): TAdminArticleTarget | undefined => response?.targets.find((target) => target.code === code);
