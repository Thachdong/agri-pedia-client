import type { TApiSchema } from "@/shared/lib/http";

export type TUserProfile = TApiSchema<"UserProfileResponse">;
export type TUserRole = TUserProfile["role"];
export type TUserAddress = NonNullable<TUserProfile["address"]>;
export type TMyAddress = TApiSchema<"MyAddressResponse">;
export type TMyAddressesResponse = TApiSchema<"ListMyAddressesResponse">;

/** Body PATCH /users/me — mọi field optional, null/thiếu = giữ nguyên; file là key đã upload lên TMP (feature media). */
export type TUpdateProfileInput = TApiSchema<"UpdateProfileDto">;
export type TUpdateProfileResponse = TApiSchema<"UpdateProfileResponse">;
