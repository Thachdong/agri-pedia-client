import type { TMediaUpload } from "@/features/media";
import type { TApiSchema } from "@/shared/lib/http";

/** GET /admin/knowledge/crops — mọi cây (kể cả chưa có bài). `targetCount - articleCount` = số bệnh/variant chưa có bài. */
export type TAdminArticleCropsResponse = TApiSchema<"ListAdminArticleCropsResponse">;
export type TAdminArticleCrop = TApiSchema<"AdminArticleCropItemResponse">;

/**
 * GET /admin/knowledge/crops/:cropSlug/articles — bệnh của cây theo tên, mỗi bệnh kèm các variant (thứ tự KB).
 * `article` null = chưa có bài (tạo bằng POST /admin/knowledge/articles với `code`).
 */
export type TAdminArticleTargetsResponse = TApiSchema<"ListAdminArticleTargetsResponse">;
export type TAdminArticleTarget = TApiSchema<"AdminArticleTargetResponse">;
export type TAdminArticleSummary = TApiSchema<"AdminArticleSummaryResponse">;
export type TAdminArticleCategory = TAdminArticleTarget["category"];

/**
 * GET /admin/knowledge/articles/:code — nội dung như lưu: `markdown` dùng tên file ảnh + link `/diseases/<CODE>`
 * (gửi lại nguyên trạng khi PUT); `images[].url` là URL public để xem trước.
 */
export type TAdminArticleDetail = TApiSchema<"AdminArticleDetailResponse">;
export type TAdminArticleImage = TAdminArticleDetail["images"][number];

/** POST /admin/knowledge/articles — bài mới published, origin ADMIN, REVIEWED bởi người gọi. Mọi ảnh cần `tmpKey`. */
export type TCreateArticleInput = TApiSchema<"CreateArticleDto">;
export type TCreateArticleResponse = TApiSchema<"CreateArticleResponse">;
export type TArticleImageInput = TCreateArticleInput["images"][number];
export type TArticleSourceInput = TCreateArticleInput["sources"][number];

/**
 * PUT /admin/knowledge/articles/:code — thay toàn bộ nội dung (slug / cây / code / hiển thị giữ nguyên).
 * `images` là danh sách đầy đủ: ảnh không có `tmpKey` = giữ ảnh đã lưu cùng `file`; ảnh bị bỏ khỏi danh sách = xoá.
 * Bài AI → AI_REVIEWED (seed không ghi đè nữa).
 */
export type TUpdateArticleInput = TApiSchema<"UpdateArticleDto">;
export type TUpdateArticleResponse = TApiSchema<"UpdateArticleResponse">;

/** POST /admin/knowledge/articles/:code/{publish|unpublish} — đã đúng trạng thái = no-op. */
export type TArticleVisibilityResponse = TApiSchema<"ArticleVisibilityResponse">;
export type TSetArticlePublishedInput = { code: string; published: boolean };

/**
 * 1 ảnh trong form: `upload` null = ảnh đã lưu (giữ theo `file`), có `upload` = ảnh mới (gửi `tmpKey` khi xong).
 * `previewUrl` = URL public của ảnh đã lưu hoặc object URL của file mới — chỉ để xem trước, không gửi server.
 */
export type TArticleImageFormValue = Omit<TArticleImageInput, "tmpKey" | "caption"> & {
  caption: string;
  previewUrl: string | null;
  upload: TMediaUpload<"IMAGE"> | null;
};

/** Giá trị form tạo / sửa bài — `code` lấy từ route; `slug` chỉ sửa được lúc tạo. */
export type TArticleFormValues = Omit<TCreateArticleInput, "code" | "images"> & {
  images: TArticleImageFormValue[];
};
