import { describe, it, expect } from "vitest";
import { normalizeDayChunk, fallbackDay } from "@/services/roadmap-service";
import { awsSaaC03 } from "@/constants/certifications/aws-saa";
import type { UserProfile } from "@/types";
import type { RawDay, RawWeek } from "@/services/ai/schemas";

const profile: UserProfile = {
  yearsExperience: 2,
  currentRole: "Dev",
  knowledgeLevel: "basic",
  experienceLevel: "beginner",
  dailyStudyHours: 2,
  targetExamDate: "2099-01-01",
  certificationId: awsSaaC03.id,
  goalScore: 800,
};

const weeks: RawWeek[] = [
  { weekNumber: 1, title: "W1", theme: "Foundations", focusDomainIds: ["design-secure"], goals: [] },
];

function day(n: number): RawDay {
  return {
    dayNumber: n,
    title: `Day ${n}`,
    domainId: "design-secure",
    topics: ["IAM"],
    objectives: ["Learn"],
    estimatedHours: 2,
    labs: [],
    revisionTopics: [],
    practiceQuestions: 10,
    examTips: [],
  };
}

const makeFallback = (n: number) => fallbackDay(n, awsSaaC03, weeks, profile);

describe("normalizeDayChunk", () => {
  it("renumbers a full batch positionally to [start,end]", () => {
    // Model returned wrong/duplicate day numbers — we fix them.
    const result = normalizeDayChunk([day(99), day(3), day(50), day(8), day(1), day(2), day(7)], 1, 7, makeFallback);
    expect(result).toHaveLength(7);
    expect(result.map((d) => d.dayNumber)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("fills missing days with valid fallback days (full coverage)", () => {
    const result = normalizeDayChunk([day(8), day(9)], 8, 14, makeFallback);
    expect(result).toHaveLength(7);
    expect(result.map((d) => d.dayNumber)).toEqual([8, 9, 10, 11, 12, 13, 14]);
    // Every produced day is structurally valid.
    for (const d of result) {
      expect(d.topics.length).toBeGreaterThan(0);
      expect(d.objectives.length).toBeGreaterThan(0);
      expect(d.estimatedHours).toBeGreaterThan(0);
    }
  });

  it("truncates an over-long batch to the expected count", () => {
    const result = normalizeDayChunk(
      Array.from({ length: 12 }, (_, i) => day(i + 1)),
      1,
      7,
      makeFallback,
    );
    expect(result).toHaveLength(7);
  });

  it("drops malformed days (no topics) and backfills", () => {
    const bad = { ...day(1), topics: [] as string[] };
    const result = normalizeDayChunk([bad, day(2)], 1, 3, makeFallback);
    expect(result).toHaveLength(3);
    expect(result.every((d) => d.topics.length > 0)).toBe(true);
  });
});

describe("fallbackDay", () => {
  it("produces a valid day mapped to a real domain", () => {
    const d = fallbackDay(5, awsSaaC03, weeks, profile);
    expect(d.dayNumber).toBe(5);
    expect(awsSaaC03.domains.some((x) => x.id === d.domainId)).toBe(true);
    expect(d.estimatedHours).toBeGreaterThan(0);
  });
});
