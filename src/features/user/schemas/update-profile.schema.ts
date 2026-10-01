import { BUSINESS_TYPE_OPTIONS } from "@/shared/constants";
import { rules, schema, v } from "@/shared/lib/validation";
import type { TUpdateFarmerProfileFormValues, TUpdateProfileFormValues } from "../types/user.types";

const BUSINESS_TYPES = BUSINESS_TYPE_OPTIONS.map((option) => option.value);

/** Mirror UpdateProfileDto + action 9 (specs/api.md) cho DISTRIBUTOR. File phải upload xong (đuôi / dung lượng đã kiểm lúc chọn). */
export const updateProfileSchema = schema<TUpdateProfileFormValues>({
  username: rules.username().required(),
  // Cho phép rỗng = xoá phần giới thiệu.
  bio: v.string().trim().max(1000).allow(""),
  bussinessType: v
    .string()
    .valid(...BUSINESS_TYPES)
    .required()
    .messages({ "any.required": "Vui lòng chọn lĩnh vực kinh doanh", "string.empty": "Vui lòng chọn lĩnh vực kinh doanh" }),
  avatar: rules.uploadedFile().allow(null),
  bussinessLicense: rules.uploadedFile().allow(null),
});

/** Mirror UpdateProfileDto cho FARMER — chỉ username, bio, avatar (bussinessType / giấy phép là của DISTRIBUTOR). */
export const updateFarmerProfileSchema = schema<TUpdateFarmerProfileFormValues>({
  username: rules.username().required(),
  bio: v.string().trim().max(1000).allow(""),
  avatar: rules.uploadedFile().allow(null),
});
