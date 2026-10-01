import { useAppQuery } from "@/shared/lib/query";
import { meQuery } from "./user.queries";

export const useMe = () => useAppQuery(meQuery());
