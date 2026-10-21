import { useAppQuery } from "@/shared/lib/query";
import { productSuggestionAiModelQuery } from "./admin-settings.queries";

export const useProductSuggestionAiModel = () => useAppQuery(productSuggestionAiModelQuery());
