import type { IHttpClient } from "@/shared/lib/http";
import { appQueryOptions, queryKeys } from "@/shared/lib/query";
import {
  getCropTopArticles,
  getDiagnosisAiModels,
  getDiagnosisSettingsAdmin,
  getTopArticleSettings,
} from "../services/admin-settings.service";

export const adminDiagnosisSettingsQuery = (client?: IHttpClient) =>
  appQueryOptions({ queryKey: queryKeys.adminSettings.diagnosis(), queryFn: () => getDiagnosisSettingsAdmin(client) });

export const adminDiagnosisAiModelsQuery = (client?: IHttpClient) =>
  appQueryOptions({ queryKey: queryKeys.adminSettings.diagnosisAiModels(), queryFn: () => getDiagnosisAiModels(client) });

export const topArticleSettingsQuery = (client?: IHttpClient) =>
  appQueryOptions({ queryKey: queryKeys.adminSettings.topArticleLimit(), queryFn: () => getTopArticleSettings(client) });

export const cropTopArticlesQuery = (cropSlug: string, client?: IHttpClient) =>
  appQueryOptions({
    queryKey: queryKeys.adminSettings.topArticles(cropSlug),
    queryFn: () => getCropTopArticles(cropSlug, client),
  });
