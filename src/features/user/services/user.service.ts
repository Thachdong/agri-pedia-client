import { http, type IHttpClient } from "@/shared/lib/http";
import type { TMyAddressesResponse, TUserProfile } from "../types/user.types";

export const getMe = (client: IHttpClient = http) => client.get<TUserProfile>("/users/me");

/** Mọi address của người đang đăng nhập, primary trước. */
export const getMyAddresses = (client: IHttpClient = http) => client.get<TMyAddressesResponse>("/users/me/addresses");
