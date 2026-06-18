"use client";

import * as React from "react";
import { seedAllContent } from "@/services/seed-service";

/**
 * Seeds community-reviewed content into IndexedDB on first load (idempotent), so
 * the app is fully useful with no API key. Runs once per mount; the service
 * itself no-ops when content is already up to date.
 */
export function ContentSeeder() {
  React.useEffect(() => {
    void seedAllContent();
  }, []);
  return null;
}
