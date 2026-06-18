import { describe, it, expect } from "vitest";
import { buildRoadmap, daysUntil } from "@/services/roadmap-service";
import { awsSaaC03 } from "@/constants/certifications/aws-saa";
import type { UserProfile } from "@/types";
import type { RawRoadmap } from "@/services/ai/schemas";

const profile: UserProfile = {
  yearsExperience: 3,
  currentRole: "Developer",
  knowledgeLevel: "moderate",
  experienceLevel: "intermediate",
  dailyStudyHours: 2,
  targetExamDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
  certificationId: awsSaaC03.id,
  goalScore: 800,
};

const raw: RawRoadmap = {
  title: "AWS SAA 2-Week Sprint",
  summary: "Intensive plan",
  months: [{ monthNumber: 1, title: "Month 1", theme: "Foundations", milestone: "Exam ready" }],
  weeks: [
    { weekNumber: 1, title: "Week 1", theme: "Core", focusDomainIds: ["design-secure"], goals: ["IAM"] },
    { weekNumber: 2, title: "Week 2", theme: "Review", focusDomainIds: ["bogus-id"], goals: ["Practice"] },
  ],
  days: [
    {
      dayNumber: 1,
      title: "IAM Basics",
      domainId: "design-secure",
      topics: ["IAM"],
      objectives: ["Understand IAM"],
      estimatedHours: 2,
      labs: [],
      revisionTopics: [],
      practiceQuestions: 10,
      examTips: [],
    },
    {
      dayNumber: 2,
      title: "Bad domain day",
      domainId: "does-not-exist",
      topics: ["?"],
      objectives: ["?"],
      estimatedHours: 2,
      labs: [],
      revisionTopics: [],
      practiceQuestions: 0,
      examTips: [],
    },
  ],
};

describe("daysUntil", () => {
  it("clamps to a minimum of 7", () => {
    expect(daysUntil(new Date().toISOString().slice(0, 10))).toBe(7);
  });
  it("computes forward dates", () => {
    const future = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    expect(daysUntil(future)).toBeGreaterThanOrEqual(29);
  });
});

describe("buildRoadmap", () => {
  const roadmap = buildRoadmap(raw, awsSaaC03, profile, "grok");

  it("assigns sequential dates and computes week/month numbers", () => {
    expect(roadmap.totalDays).toBe(2);
    expect(roadmap.days[0].weekNumber).toBe(1);
    expect(roadmap.days[0].date < roadmap.days[1].date).toBe(true);
  });

  it("falls back to the first domain for invalid domainIds", () => {
    const badDay = roadmap.days.find((d) => d.title === "Bad domain day")!;
    expect(awsSaaC03.domains.some((d) => d.id === badDay.domainId)).toBe(true);
  });

  it("drops invalid focusDomainIds from weeks", () => {
    const week2 = roadmap.weeks.find((w) => w.weekNumber === 2)!;
    expect(week2.focusDomainIds).not.toContain("bogus-id");
  });

  it("sums total hours", () => {
    expect(roadmap.totalHours).toBe(4);
  });
});
