import { http, type IHttpClient } from "@/shared/lib/http";
import type {
  TMyAddressesResponse,
  TUpdateProfileInput,
  TUpdateProfileResponse,
  TUserProfile,
} from "../types/user.types";

export const getMe = (client: IHttpClient = http) => client.get<TUserProfile>("/users/me");

/** Mọi address của người đang đăng nhập, primary trước. */
export const getMyAddresses = (client: IHttpClient = http) => client.get<TMyAddressesResponse>("/users/me/addresses");

/** bussinessType chỉ DISTRIBUTOR (USER_BUSINESS_TYPE_NOT_ALLOWED), không set null được (USER_BUSINESS_TYPE_REQUIRED). */
export const updateMe = (input: TUpdateProfileInput, client: IHttpClient = http) =>
  client.patch<TUpdateProfileResponse>("/users/me", input);
