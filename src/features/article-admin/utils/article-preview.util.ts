import type { TArticleMarkdownSource } from "@/features/article";
import type { TAdminArticleCrop, TArticleFormValues } from "../types/article-admin.types";
import { resolvePreviewImages } from "./article-markdown.util";

/** Kích thước tạm cho next/image khi chưa biết kích thước thật (ảnh mới) — ảnh vẫn hiển thị đúng tỉ lệ. */
const PREVIEW_IMAGE_WIDTH = 1600;
const PREVIEW_IMAGE_HEIGHT = 900;

export type TArticlePreviewCrop = Pick<TAdminArticleCrop, "code" | "slug" | "nameVi" | "diagnosisEnabled">;

/**
 * Nội dung form → dữ liệu cho ArticleMarkdown: ảnh trỏ tới URL xem trước (ảnh đã lưu / object URL của ảnh mới).
 * `::disease-card` không hiện trong xem trước (cần dữ liệu bệnh liên quan mà server chỉ trả ở trang public).
 */
export const toArticlePreview = (
  { markdown, images }: Pick<TArticleFormValues, "markdown" | "images">,
  crop: TArticlePreviewCrop,
): TArticleMarkdownSource => {
  const withUrl = images.filter((image): image is typeof image & { previewUrl: string } => Boolean(image.previewUrl));
  return {
    markdown: resolvePreviewImages(markdown, new Map(withUrl.map((image) => [image.file, image.previewUrl]))),
    images: withUrl.map(({ previewUrl, alt, caption, credit }) => ({
      url: previewUrl,
      alt,
      caption: caption || null,
      credit,
      width: PREVIEW_IMAGE_WIDTH,
      height: PREVIEW_IMAGE_HEIGHT,
    })),
    relatedDiseases: [],
    crop,
  };
};

/** Cây cho xem trước từ danh sách cây (có thể chưa tải được) — thiếu thì dùng slug, coi như chưa bật chẩn đoán. */
export const toPreviewCrop = (
  crops: readonly TAdminArticleCrop[] | undefined,
  crop: { slug: string; code?: string },
): TArticlePreviewCrop => {
  const found = crops?.find((item) => item.slug === crop.slug);
  return {
    code: found?.code ?? crop.code ?? "",
    slug: crop.slug,
    nameVi: found?.nameVi ?? crop.slug,
    diagnosisEnabled: found?.diagnosisEnabled ?? false,
  };
};
