import type { TAddressFieldsValue } from "@/features/location";
import type { TMediaUpload } from "@/features/media";
import type { TApiSchema } from "@/shared/lib/http";
import type { TBusinessType } from "@/shared/types";

export type TUserProfile = TApiSchema<"UserProfileResponse">;
export type TUserRole = TUserProfile["role"];
export type TUserAddress = NonNullable<TUserProfile["address"]>;
export type TMyAddress = TApiSchema<"MyAddressResponse">;
export type TMyAddressesResponse = TApiSchema<"ListMyAddressesResponse">;
/** Body POST /users/me/addresses — province / ward là codename (feature location). */
export type TCreateAddressInput = TApiSchema<"CreateAddressDto">;
export type TCreateAddressResponse = TApiSchema<"CreateAddressResponse">;
/** Giá trị form thêm address — lat/long chưa có khi chưa chọn trên map; submit gửi `isPrimary: false`. */
export type TCreateAddressFormValues = TAddressFieldsValue;

/** Body PATCH /users/me — mọi field optional, null/thiếu = giữ nguyên; file là key đã upload lên TMP (feature media). */
export type TUpdateProfileInput = TApiSchema<"UpdateProfileDto">;
export type TUpdateProfileResponse = TApiSchema<"UpdateProfileResponse">;

/**
 * Giá trị form Edit profile (M6) — file là item upload ngay khi chọn (null = giữ file cũ); submit lấy `media` (key TMP)
 * đổi sang `TUpdateProfileInput`. Form chỉ dành cho DISTRIBUTOR nên bussinessType bắt buộc.
 */
export type TUpdateProfileFormValues = {
  username: string;
  bio: string;
  bussinessType: TBusinessType;
  avatar: TMediaUpload<"IMAGE"> | null;
  bussinessLicense: TMediaUpload<"IMAGE" | "FILE"> | null;
};

/** Giá trị form Edit profile của FARMER — không có bussinessType / giấy phép (server: USER_BUSINESS_TYPE_NOT_ALLOWED). */
export type TUpdateFarmerProfileFormValues = Pick<TUpdateProfileFormValues, "username" | "bio" | "avatar">;
