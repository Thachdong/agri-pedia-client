"use client";

import { Toaster } from "@/shared/components/atoms";
import { QueryProvider } from "@/shared/lib/query";

/** Gộp mọi provider phía client (Query, Toaster, sau này: Theme...). */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      {children}
      <Toaster position="top-center" closeButton />
    </QueryProvider>
  );
}
