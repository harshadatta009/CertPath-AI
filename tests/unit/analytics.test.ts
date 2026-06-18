import { describe, it, expect } from "vitest";
import {
  computeDomainScores,
  computeReadiness,
  computePassProbability,
  computeConsistency,
  computeStreak,
  computeAnalytics,
} from "@/services/analytics-service";
import { awsSaaC03 } from "@/constants/certifications/aws-saa";
import type { QuizAttempt, StudySession } from "@/types";

function attempt(domainId: string, correct: boolean): QuizAttempt {
  return {
    id: Math.random().toString(),
    certificationId: awsSaaC03.id,
    questionId: "q",
    domainId,
    difficulty: "medium",
    correct,
    createdAt: Date.now(),
  };
}

function sessionOn(date: string): StudySession {
  return { id: date, roadmapId: "r", date, hours: 2, createdAt: Date.now() };
}

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

describe("computeDomainScores", () => {
  it("returns 0 for untested domains", () => {
    const scores = computeDomainScores(awsSaaC03, []);
    expect(scores).toHaveLength(awsSaaC03.domains.length);
    expect(scores.every((s) => s.score === 0 && s.attempts === 0)).toBe(true);
  });

  it("scores a perfect domain near 100 with smoothing", () => {
    const attempts = Array.from({ length: 8 }, () => attempt("design-secure", true));
    const scores = computeDomainScores(awsSaaC03, attempts);
    const secure = scores.find((s) => s.domainId === "design-secure")!;
    expect(secure.attempts).toBe(8);
    expect(secure.score).toBeGreaterThan(85);
    expect(secure.score).toBeLessThanOrEqual(100);
  });
});

describe("computeReadiness", () => {
  it("blends completion (60%) and mastery (40%)", () => {
    const scores = awsSaaC03.domains.map((d) => ({
      domainId: d.id,
      domainName: d.name,
      score: 100,
      attempts: 5,
    }));
    // 50% completion + 100% mastery => 0.6*50 + 0.4*100 = 70
    expect(computeReadiness(awsSaaC03, 50, scores)).toBe(70);
  });
});

describe("computePassProbability", () => {
  it("is monotonic in readiness", () => {
    expect(computePassProbability(80, 30)).toBeGreaterThan(
      computePassProbability(40, 30),
    );
  });
  it("never reaches 1", () => {
    expect(computePassProbability(100, 60)).toBeLessThan(1);
  });
});

describe("computeStreak", () => {
  it("counts consecutive days ending today", () => {
    const sessions = [isoDaysAgo(0), isoDaysAgo(1), isoDaysAgo(2)].map(sessionOn);
    expect(computeStreak(sessions)).toBe(3);
  });
  it("breaks on a gap", () => {
    const sessions = [isoDaysAgo(0), isoDaysAgo(2)].map(sessionOn);
    expect(computeStreak(sessions)).toBe(1);
  });
});

describe("computeConsistency", () => {
  it("is 0 with no sessions and >0 with recent ones", () => {
    expect(computeConsistency([])).toBe(0);
    expect(computeConsistency([sessionOn(isoDaysAgo(0))])).toBeGreaterThan(0);
  });
});

describe("computeAnalytics", () => {
  it("produces a full snapshot offline", () => {
    const snapshot = computeAnalytics({
      cert: awsSaaC03,
      roadmap: null,
      completions: [],
      sessions: [sessionOn(isoDaysAgo(0))],
      attempts: [attempt("design-secure", true), attempt("design-cost", false)],
    });
    expect(snapshot.readinessScore).toBeGreaterThanOrEqual(0);
    expect(snapshot.passProbability).toBeGreaterThanOrEqual(0);
    expect(snapshot.totalStudyHours).toBeGreaterThan(0);
  });
});
