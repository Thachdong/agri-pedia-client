import { http, type IHttpClient } from "@/shared/lib/http";
import type {
  TCreateAddressInput,
  TCreateAddressResponse,
  TMyAddressesResponse,
  TUpdateProfileInput,
  TUpdateProfileResponse,
  TUserProfile,
} from "../types/user.types";

export const getMe = (client: IHttpClient = http) => client.get<TUserProfile>("/users/me");

/** Mọi address của người đang đăng nhập, primary trước. */
export const getMyAddresses = (client: IHttpClient = http) => client.get<TMyAddressesResponse>("/users/me/addresses");

/** `isPrimary: true` → address mới thành primary, primary cũ thành thường. 400 USER_INVALID_COORDINATES / USER_LOCATION_INVALID. */
export const createMyAddress = (input: TCreateAddressInput, client: IHttpClient = http) =>
  client.post<TCreateAddressResponse>("/users/me/addresses", input);

/** Primary cũ thành thường; đã primary → 200, không đổi. Address của người khác → 404 USER_ADDRESS_NOT_FOUND. */
export const setMyPrimaryAddress = (addressId: string, client: IHttpClient = http) =>
  client.patch<void>(`/users/me/addresses/${encodeURIComponent(addressId)}/primary`);

/** Xoá hẳn. Primary không xoá được → 409 USER_ADDRESS_PRIMARY_NOT_DELETABLE (đặt primary khác trước). */
export const deleteMyAddress = (addressId: string, client: IHttpClient = http) =>
  client.delete<void>(`/users/me/addresses/${encodeURIComponent(addressId)}`);

/** bussinessType chỉ DISTRIBUTOR (USER_BUSINESS_TYPE_NOT_ALLOWED), không set null được (USER_BUSINESS_TYPE_REQUIRED). */
export const updateMe = (input: TUpdateProfileInput, client: IHttpClient = http) =>
  client.patch<TUpdateProfileResponse>("/users/me", input);
