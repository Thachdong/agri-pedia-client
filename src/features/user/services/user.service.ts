import { http, type IHttpClient } from "@/shared/lib/http";
import type { TUserProfile } from "../types/user.types";

export const getMe = (client: IHttpClient = http) => client.get<TUserProfile>("/users/me");
