"use client";

import { QueryProvider } from "@/shared/lib/query";

/** Gộp mọi provider phía client (Query, sau này: Toaster, Theme...). */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
