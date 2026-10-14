import type { TApiSchema } from "@/shared/lib/http";

/** Loại hình kinh doanh của DISTRIBUTOR — dùng ở đăng ký (auth) và danh sách distributor. */
export type TBusinessType = NonNullable<TApiSchema<"NearbyDistributorResponse">["bussinessType"]>;
