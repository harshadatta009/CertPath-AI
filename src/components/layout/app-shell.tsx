"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useSettingsStore } from "@/store/settings-store";
import { useRoadmapStore } from "@/store/roadmap-store";

/**
 * Authenticated-feeling app shell (no auth). Loads roadmaps from IndexedDB once
 * settings have hydrated, then renders the sidebar + header + page content.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const settingsLoaded = useSettingsStore((s) => s.loaded);
  const activeRoadmapId = useSettingsStore((s) => s.settings.activeRoadmapId);
  const loadRoadmaps = useRoadmapStore((s) => s.load);
  const roadmapsLoaded = useRoadmapStore((s) => s.loaded);

  React.useEffect(() => {
    if (settingsLoaded && !roadmapsLoaded) {
      void loadRoadmaps(activeRoadmapId);
    }
  }, [settingsLoaded, roadmapsLoaded, activeRoadmapId, loadRoadmaps]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
