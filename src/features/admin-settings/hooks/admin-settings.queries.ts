import type { IHttpClient } from "@/shared/lib/http";
import { appQueryOptions, queryKeys } from "@/shared/lib/query";
import { getDiagnosisSettingsAdmin, getTopArticleSettings } from "../services/admin-settings.service";

export const adminDiagnosisSettingsQuery = (client?: IHttpClient) =>
  appQueryOptions({ queryKey: queryKeys.adminSettings.diagnosis(), queryFn: () => getDiagnosisSettingsAdmin(client) });

export const topArticleSettingsQuery = (client?: IHttpClient) =>
  appQueryOptions({ queryKey: queryKeys.adminSettings.topArticleLimit(), queryFn: () => getTopArticleSettings(client) });
