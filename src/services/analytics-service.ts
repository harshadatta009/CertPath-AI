import { differenceInCalendarDays, parseISO } from "date-fns";
import { clamp, pct, round } from "@/lib/utils";
import type {
  CertificationConfig,
  Roadmap,
  DayCompletion,
  StudySession,
  QuizAttempt,
  AnalyticsSnapshot,
  DomainScore,
} from "@/types";

/** Consecutive-day streak ending today, derived from study sessions. */
export function computeStreak(sessions: StudySession[]): number {
  if (sessions.length === 0) return 0;
  const days = new Set(sessions.filter((s) => s.hours > 0).map((s) => s.date));
  let streak = 0;
  const cursor = new Date();
  // Allow today to be missing without breaking the streak yet.
  if (!days.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Per-domain mastery (0-100) from quiz attempts, with a neutral prior. */
export function computeDomainScores(
  cert: CertificationConfig,
  attempts: QuizAttempt[],
): DomainScore[] {
  return cert.domains.map((d) => {
    const domainAttempts = attempts.filter((a) => a.domainId === d.id);
    const correct = domainAttempts.filter((a) => a.correct).length;
    // Laplace smoothing toward 50% so untested domains aren't falsely "strong".
    const score =
      domainAttempts.length === 0
        ? 0
        : round(((correct + 1) / (domainAttempts.length + 2)) * 100);
    return {
      domainId: d.id,
      domainName: d.name,
      score,
      attempts: domainAttempts.length,
    };
  });
}

/**
 * Readiness blends roadmap completion (60%) with weighted quiz mastery (40%).
 * Mastery is weighted by each domain's exam weightage.
 */
export function computeReadiness(
  cert: CertificationConfig,
  completion: number,
  domainScores: DomainScore[],
): number {
  const totalWeight = cert.domains.reduce((s, d) => s + d.weightage, 0) || 1;
  const weightedMastery =
    cert.domains.reduce((sum, d) => {
      const ds = domainScores.find((s) => s.domainId === d.id);
      return sum + (ds?.score ?? 0) * d.weightage;
    }, 0) / totalWeight;
  return clamp(round(completion * 0.6 + weightedMastery * 0.4), 0, 100);
}

/** Logistic mapping from readiness + time pressure to a pass probability. */
export function computePassProbability(
  readiness: number,
  daysRemaining: number,
): number {
  const base = 1 / (1 + Math.exp(-(readiness - 55) / 12));
  // Slight penalty when very little time remains and readiness is low.
  const timeFactor = daysRemaining < 7 && readiness < 60 ? 0.85 : 1;
  return round(clamp(base * timeFactor, 0, 0.99), 2);
}

/** Study consistency (0-100) over the trailing 14 days. */
export function computeConsistency(sessions: StudySession[]): number {
  const window = 14;
  const studiedDays = new Set(
    sessions.filter((s) => s.hours > 0).map((s) => s.date),
  );
  const today = new Date();
  let active = 0;
  for (let i = 0; i < window; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (studiedDays.has(d.toISOString().slice(0, 10))) active++;
  }
  return pct(active, window);
}

export interface AnalyticsInput {
  cert: CertificationConfig;
  roadmap: Roadmap | null;
  completions: DayCompletion[];
  sessions: StudySession[];
  attempts: QuizAttempt[];
}

/** Compute the full analytics snapshot. Pure and fully offline. */
export function computeAnalytics({
  cert,
  roadmap,
  completions,
  sessions,
  attempts,
}: AnalyticsInput): AnalyticsSnapshot {
  const totalDays = roadmap?.totalDays ?? 0;
  const completedDays = completions.filter((c) => c.completed).length;
  const completion = pct(completedDays, totalDays);

  const domainScores = computeDomainScores(cert, attempts);
  const readinessScore = computeReadiness(cert, completion, domainScores);

  const daysRemaining = roadmap
    ? Math.max(
        0,
        differenceInCalendarDays(parseISO(roadmap.profile.targetExamDate), new Date()),
      )
    : 0;
  const passProbability = computePassProbability(readinessScore, daysRemaining);

  const totalStudyHours = round(
    sessions.reduce((s, x) => s + x.hours, 0) +
      completions.reduce((s, c) => s + c.actualHours, 0),
    1,
  );

  const tested = domainScores.filter((d) => d.attempts > 0);
  const ranked = [...tested].sort((a, b) => a.score - b.score);
  const weakDomains = ranked.slice(0, 3).filter((d) => d.score < 70);
  const strongDomains = [...tested]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .filter((d) => d.score >= 70);

  const recommendedTopics = (weakDomains.length ? weakDomains : ranked.slice(0, 3))
    .flatMap((d) => {
      const domain = cert.domains.find((x) => x.id === d.domainId);
      return domain ? domain.topics.slice(0, 2).map((t) => t.name) : [];
    })
    .slice(0, 6);

  return {
    readinessScore,
    completion,
    passProbability,
    studyStreak: computeStreak(sessions),
    consistency: computeConsistency(sessions),
    totalStudyHours,
    weakDomains,
    strongDomains,
    recommendedTopics,
  };
}
