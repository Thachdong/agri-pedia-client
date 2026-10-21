import { publicEnv } from "@/shared/config";
import { createHttpClient } from "../http/create-http-client";

/** Kết quả reverse geocode, không phụ thuộc provider. */
export type TReverseGeocodeResult = {
  /** Tên mọi địa danh chứa điểm (tỉnh, phường/xã, khu phố...) — không cố định cấp nào ở key nào, bên dùng tự đối chiếu. */
  places: string[];
  /** Số nhà + tên đường, rỗng khi không có. */
  street: string;
};

type TNominatimAddress = Record<string, string | undefined>;
type TNominatimResponse = { address?: TNominatimAddress; error?: string };

/** Key của Nominatim không phải địa danh. */
const NON_PLACE_KEYS = new Set(["country", "country_code", "postcode", "house_number", "road"]);

/** Gọi thẳng từ browser (Nominatim cho CORS `*`), không qua BFF — lượng gọi thấp, chỉ khi user chọn vị trí. */
const geocodeClient = createHttpClient({ baseUrl: publicEnv.geocodeUrl });

/** Toạ độ → địa danh. Điểm ngoài đất liền (biển...) → `places` rỗng. */
export async function reverseGeocode(lat: number, long: number, signal?: AbortSignal): Promise<TReverseGeocodeResult> {
  const data = await geocodeClient.get<TNominatimResponse>("/reverse", {
    query: { lat, lon: long, format: "jsonv2", addressdetails: 1, zoom: 18, "accept-language": "vi" },
    signal,
  });
  const address = data.address ?? {};
  const places = Object.entries(address)
    .filter(([key, value]) => value && !NON_PLACE_KEYS.has(key) && !key.startsWith("ISO3166"))
    .map(([, value]) => value as string);
  const street = [address.house_number, address.road].filter(Boolean).join(" ");
  return { places, street };
}
