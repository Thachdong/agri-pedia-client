import type { TApiSchema } from "@/shared/lib/http";

/** GET / PUT /admin/diagnosis/settings. */
export type TDiagnosisSettingsAdmin = TApiSchema<"DiagnosisSettingsResponse">;
export type TUpdateDiagnosisSettingsInput = TApiSchema<"UpdateDiagnosisSettingsDto">;
