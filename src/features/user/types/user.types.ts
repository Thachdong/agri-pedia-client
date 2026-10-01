import type { TApiSchema } from "@/shared/lib/http";
import type { TBusinessType } from "@/shared/types";

export type TUserProfile = TApiSchema<"UserProfileResponse">;
export type TUserRole = TUserProfile["role"];
export type TUserAddress = NonNullable<TUserProfile["address"]>;
export type TMyAddress = TApiSchema<"MyAddressResponse">;
export type TMyAddressesResponse = TApiSchema<"ListMyAddressesResponse">;

/** Body PATCH /users/me — mọi field optional, null/thiếu = giữ nguyên; file là key đã upload lên TMP (feature media). */
export type TUpdateProfileInput = TApiSchema<"UpdateProfileDto">;
export type TUpdateProfileResponse = TApiSchema<"UpdateProfileResponse">;

/**
 * Giá trị form Edit profile (M6) — file giữ nguyên `File` đã chọn (null = giữ file cũ), upload lúc submit
 * rồi mới đổi sang `TUpdateProfileInput`. Form chỉ dành cho DISTRIBUTOR nên bussinessType bắt buộc.
 */
export type TUpdateProfileFormValues = {
  username: string;
  bio: string;
  bussinessType: TBusinessType;
  avatar: File | null;
  bussinessLicense: File | null;
};
