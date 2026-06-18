"use client";

import * as React from "react";
import { useRoadmapStore } from "@/store/roadmap-store";
import { getCertification } from "@/constants/certifications";
import { progressRepo } from "@/database/repositories";
import { computeAnalytics } from "@/services/analytics-service";
import type { AnalyticsSnapshot, StudySession, QuizAttempt } from "@/types";

/**
 * Compute analytics for the active roadmap. Fully offline — derives everything
 * from IndexedDB (completions, study sessions, quiz attempts).
 */
export function useAnalytics() {
  const active = useRoadmapStore((s) => s.active);
  const completions = useRoadmapStore((s) => s.completions);
  const [sessions, setSessions] = React.useState<StudySession[]>([]);
  const [attempts, setAttempts] = React.useState<QuizAttempt[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!active) {
        setLoading(false);
        return;
      }
      const [s, a] = await Promise.all([
        progressRepo.sessionsForRoadmap(active.id),
        progressRepo.attemptsForCertification(active.certificationId),
      ]);
      if (!cancelled) {
        setSessions(s);
        setAttempts(a);
        setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [active, completions]);

  const snapshot: AnalyticsSnapshot | null = React.useMemo(() => {
    if (!active) return null;
    const cert = getCertification(active.certificationId);
    if (!cert) return null;
    return computeAnalytics({ cert, roadmap: active, completions, sessions, attempts });
  }, [active, completions, sessions, attempts]);

  return { snapshot, sessions, attempts, loading, active };
}
