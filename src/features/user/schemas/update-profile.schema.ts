import { MEDIA_ALLOWED_EXTENSIONS, MEDIA_MAX_FILE_BYTES } from "@/features/media";
import { BUSINESS_TYPE_OPTIONS } from "@/shared/constants";
import { rules, schema, v } from "@/shared/lib/validation";
import type { TUpdateProfileFormValues } from "../types/user.types";

const BUSINESS_TYPES = BUSINESS_TYPE_OPTIONS.map((option) => option.value);
const LICENSE_EXTENSIONS = [...MEDIA_ALLOWED_EXTENSIONS.IMAGE, ...MEDIA_ALLOWED_EXTENSIONS.FILE];

/** Mirror UpdateProfileDto + action 9 (specs/api.md) cho DISTRIBUTOR. File kiểm tra trước khi upload (đuôi theo POST /media/presign-url, ≤10MB). */
export const updateProfileSchema = schema<TUpdateProfileFormValues>({
  username: rules.username().required(),
  // Cho phép rỗng = xoá phần giới thiệu.
  bio: v.string().trim().max(1000).allow(""),
  bussinessType: v
    .string()
    .valid(...BUSINESS_TYPES)
    .required()
    .messages({ "any.required": "Vui lòng chọn lĩnh vực kinh doanh", "string.empty": "Vui lòng chọn lĩnh vực kinh doanh" }),
  avatar: rules.file({ extensions: MEDIA_ALLOWED_EXTENSIONS.IMAGE, maxBytes: MEDIA_MAX_FILE_BYTES }).allow(null),
  bussinessLicense: rules.file({ extensions: LICENSE_EXTENSIONS, maxBytes: MEDIA_MAX_FILE_BYTES }).allow(null),
});
