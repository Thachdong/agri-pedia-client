import type { TApiSchema } from "@/shared/lib/http";

export type TUserProfile = TApiSchema<"UserProfileResponse">;
export type TUserRole = TUserProfile["role"];
export type TUserAddress = NonNullable<TUserProfile["address"]>;
export type TMyAddress = TApiSchema<"MyAddressResponse">;
export type TMyAddressesResponse = TApiSchema<"ListMyAddressesResponse">;
