import { http, type IHttpClient } from "@/shared/lib/http";
import type {
  TCreateDiagnosisInput,
  TCreateDiagnosisMeta,
  TCreateDiagnosisResponse,
  TDiagnosis,
  TDiagnosisListPage,
  TDiagnosisSettings,
} from "../types/diagnosis.types";

/**
 * multipart: `images` (1..5 file, cùng thứ tự với `meta.images`) + `meta` JSON. Không tự set content-type
 * để browser thêm boundary. 202 `{ id, status: PROCESSING }` — kết quả qua realtime / poll GET /diagnoses/:id.
 */
export const createDiagnosis = ({ cropType, images, note }: TCreateDiagnosisInput, client: IHttpClient = http) => {
  const meta: TCreateDiagnosisMeta = { cropType, images: images.map(({ plantPart }) => ({ plantPart })), note };
  const form = new FormData();
  images.forEach(({ blob }, index) => form.append("images", blob, `image-${index}.jpg`));
  form.append("meta", JSON.stringify(meta));
  return client.post<TCreateDiagnosisResponse>("/diagnoses", form);
};

/** Chẩn đoán của chính mình (của người khác → 404 DIAGNOSIS_NOT_FOUND). */
export const getDiagnosis = (id: string, client: IHttpClient = http) =>
  client.get<TDiagnosis>(`/diagnoses/${encodeURIComponent(id)}`);

/** Lịch sử của tôi, mới nhất trước, phân trang cursor. */
export const getMyDiagnoses = (
  { cursor, limit }: { cursor?: string; limit?: number } = {},
  client: IHttpClient = http,
) => client.get<TDiagnosisListPage>("/diagnoses", { query: { cursor, limit } });

/** Public (token tuỳ chọn) — thông số form chẩn đoán do admin cấu hình + lượt còn lại hôm nay của người gọi. */
export const getDiagnosisSettings = (client: IHttpClient = http) => client.get<TDiagnosisSettings>("/diagnoses/settings");
