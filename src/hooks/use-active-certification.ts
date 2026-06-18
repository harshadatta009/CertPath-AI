"use client";

import { useRoadmapStore } from "@/store/roadmap-store";
import {
  getCertification,
  getCertificationOrThrow,
  DEFAULT_CERTIFICATION_ID,
} from "@/constants/certifications";
import type { CertificationConfig } from "@/types";

/**
 * The certification the user is currently working on — derived from the active
 * roadmap, falling back to the default certification when none exists yet.
 */
export function useActiveCertification(): CertificationConfig {
  const active = useRoadmapStore((s) => s.active);
  if (active) {
    return getCertification(active.certificationId) ?? getCertificationOrThrow(DEFAULT_CERTIFICATION_ID);
  }
  return getCertificationOrThrow(DEFAULT_CERTIFICATION_ID);
}
