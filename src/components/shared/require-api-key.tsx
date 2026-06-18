"use client";

import * as React from "react";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./empty-state";
import { useSettingsStore } from "@/store/settings-store";

/**
 * Gate for features that need AI generation. Offline-available content still
 * renders for the user even without a key — this only guards generation entry
 * points. Pass `children` that require a key; show the notice otherwise.
 */
export function RequireApiKey({ children }: { children: React.ReactNode }) {
  const loaded = useSettingsStore((s) => s.loaded);
  const hasKey = useSettingsStore((s) => Boolean(s.settings.apiKey));

  if (loaded && !hasKey) {
    return (
      <EmptyState
        icon={KeyRound}
        title="Add your API key to generate"
        description="CertPath AI uses your own LLM provider key. It's stored locally on this device and never sent anywhere except the provider."
        action={
          <Button asChild variant="gradient">
            <Link href="/settings">Open Settings</Link>
          </Button>
        }
      />
    );
  }
  return <>{children}</>;
}
