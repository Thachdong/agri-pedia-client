import { rules, schema, v } from "@/shared/lib/validation";
import {
  ARTICLE_CREDIT_AUTHOR_MAX,
  ARTICLE_CREDIT_LICENSE_MAX,
  ARTICLE_CREDIT_SOURCE_MAX,
  ARTICLE_IMAGE_ALT_MAX,
  ARTICLE_IMAGE_CAPTION_MAX,
  ARTICLE_IMAGE_FILE_MAX,
  ARTICLE_IMAGE_FILE_PATTERN,
  ARTICLE_MARKDOWN_MAX,
  ARTICLE_SLUG_MAX,
  ARTICLE_SLUG_PATTERN,
  ARTICLE_SOURCE_TITLE_MAX,
  ARTICLE_SUMMARY_MAX,
  ARTICLE_SUMMARY_MIN,
  ARTICLE_TITLE_MAX,
} from "../constants/article-admin.constants";
import type { TArticleFormValues, TArticleImageFormValue } from "../types/article-admin.types";
import { listBodyImageTargets } from "../utils/article-markdown.util";

const httpUrl = () => v.string().trim().uri({ scheme: ["http", "https"] });

/** Ảnh trong thân bài chưa có trong danh sách ảnh (server: "image <file> is not listed in images"). */
const unlistedBodyImages = (markdown: string, parent: unknown) => {
  const { images = [] } = (parent ?? {}) as Partial<TArticleFormValues>;
  const files = new Set(images.map((image) => image.file));
  return [...new Set(listBodyImageTargets(markdown))].filter((target) => !files.has(target));
};

const imageSchema = schema<TArticleImageFormValue>({
  file: v
    .string()
    .trim()
    .max(ARTICLE_IMAGE_FILE_MAX)
    .pattern(ARTICLE_IMAGE_FILE_PATTERN)
    .required()
    .messages({ "string.pattern.base": "Chỉ gồm a-z, 0-9, dấu - và đuôi .webp (vd. dao-on-la.webp)" }),
  // Ảnh mới phải upload xong; null = ảnh đã lưu.
  upload: rules.uploadedFile().allow(null),
  previewUrl: v.string().allow(null),
  alt: v.string().trim().min(1).max(ARTICLE_IMAGE_ALT_MAX).required(),
  caption: v.string().trim().max(ARTICLE_IMAGE_CAPTION_MAX).allow(""),
  credit: v
    .object({
      source: v.string().trim().min(1).max(ARTICLE_CREDIT_SOURCE_MAX).required(),
      author: v.string().trim().min(1).max(ARTICLE_CREDIT_AUTHOR_MAX).required(),
      license: v.string().trim().min(1).max(ARTICLE_CREDIT_LICENSE_MAX).required(),
      url: httpUrl().required(),
    })
    .required(),
});

/** Field chung tạo / sửa — mirror UpdateArticleDto + luật nội dung của server (title 1-70, summary 50-160...). */
const contentFields = {
  title: v.string().trim().min(1).max(ARTICLE_TITLE_MAX).required().messages({ "string.empty": "Vui lòng nhập tiêu đề" }),
  summary: v
    .string()
    .trim()
    .min(ARTICLE_SUMMARY_MIN)
    .max(ARTICLE_SUMMARY_MAX)
    .required()
    .messages({ "string.empty": "Vui lòng nhập tóm tắt" }),
  markdown: v
    .string()
    .trim()
    .min(1)
    .max(ARTICLE_MARKDOWN_MAX)
    .custom((markdown: string, helpers) => {
      const missing = unlistedBodyImages(markdown, helpers.state.ancestors[0]);
      return missing.length ? helpers.error("markdown.imageNotListed", { files: missing.join(", ") }) : markdown;
    })
    .required()
    .messages({
      "string.empty": "Vui lòng nhập nội dung",
      "markdown.imageNotListed": "Ảnh chưa có trong danh sách ảnh: {#files}",
    }),
  images: v
    .array()
    .items(imageSchema)
    .min(1)
    .unique("file")
    .required()
    .messages({ "array.min": "Cần ít nhất 1 ảnh (làm ảnh bìa)", "array.unique": "Tên file ảnh bị trùng" }),
  cover: v
    .string()
    .valid(v.in("images", { adjust: (images: TArticleImageFormValue[]) => images.map((image) => image.file) }))
    .required()
    .messages({ "any.only": "Chọn ảnh bìa trong danh sách ảnh", "string.empty": "Chọn ảnh bìa trong danh sách ảnh" }),
  sources: v
    .array()
    .items(
      v.object({
        title: v.string().trim().min(1).max(ARTICLE_SOURCE_TITLE_MAX).required(),
        url: httpUrl().required(),
      }),
    )
    .required(),
};

/** Viết bài mới (CreateArticleDto) — `slug` cố định về sau, duy nhất trong cây. */
export const createArticleSchema = schema<TArticleFormValues>({
  ...contentFields,
  slug: v
    .string()
    .trim()
    .min(1)
    .max(ARTICLE_SLUG_MAX)
    .pattern(ARTICLE_SLUG_PATTERN)
    .required()
    .messages({
      "string.empty": "Vui lòng nhập slug",
      "string.pattern.base": "Chỉ gồm a-z, 0-9 và dấu - giữa các từ (vd. dao-on-la)",
    }),
});

/** Sửa bài (UpdateArticleDto) — slug không đổi được nên không kiểm. */
export const updateArticleSchema = schema<TArticleFormValues>({
  ...contentFields,
  slug: v.string().allow(""),
});
