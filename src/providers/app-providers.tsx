"use client";

import * as React from "react";
import { ThemeProvider } from "./theme-provider";
import { QueryProvider } from "./query-provider";
import { ServiceWorkerCleanup } from "./sw-cleanup";
import { ContentSeeder } from "./content-seeder";
import { Toaster } from "@/components/ui/toast";
import { useSettingsStore } from "@/store/settings-store";

/** Hydrates persisted settings from IndexedDB on first mount. */
function Hydrator({ children }: { children: React.ReactNode }) {
  const hydrate = useSettingsStore((s) => s.hydrate);
  React.useEffect(() => {
    void hydrate();
  }, [hydrate]);
  return <>{children}</>;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <QueryProvider>
        <ServiceWorkerCleanup />
        <ContentSeeder />
        <Hydrator>{children}</Hydrator>
        <Toaster />
      </QueryProvider>
    </ThemeProvider>
  );
}
