import { useAppQuery } from "@/shared/lib/query";
import { distributorProfileQuery } from "./distributor.queries";

export const useDistributorProfile = (distributorId: string) => useAppQuery(distributorProfileQuery(distributorId));
