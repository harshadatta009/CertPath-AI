import { addDays, formatISO } from "date-fns";
import { uid } from "@/lib/utils";
import { createProvider } from "./ai";
import type { AppSettings } from "@/types";
import type { CertificationConfig, UserProfile, Roadmap, RoadmapDay } from "@/types";
import type { RawRoadmap } from "./ai/schemas";
import { roadmapRepo } from "@/database/repositories";

function isoDate(d: Date): string {
  return formatISO(d, { representation: "date" });
}

/** Map validated raw roadmap JSON onto our persisted Roadmap entity. */
export function buildRoadmap(
  raw: RawRoadmap,
  cert: CertificationConfig,
  profile: UserProfile,
  generatedBy: string,
): Roadmap {
  const now = Date.now();
  const start = new Date();
  const validDomainIds = new Set(cert.domains.map((d) => d.id));

  const days: RoadmapDay[] = raw.days
    .slice()
    .sort((a, b) => a.dayNumber - b.dayNumber)
    .map((d) => {
      const weekNumber = Math.ceil(d.dayNumber / 7);
      const monthNumber = Math.ceil(d.dayNumber / 30);
      const domainId = validDomainIds.has(d.domainId)
        ? d.domainId
        : cert.domains[0]?.id ?? "";
      return {
        id: uid("day"),
        dayNumber: d.dayNumber,
        weekNumber,
        monthNumber,
        date: isoDate(addDays(start, d.dayNumber - 1)),
        title: d.title,
        domainId,
        topics: d.topics,
        objectives: d.objectives,
        estimatedHours: d.estimatedHours,
        labs: d.labs,
        revisionTopics: d.revisionTopics,
        practiceQuestions: d.practiceQuestions,
        examTips: d.examTips,
        completed: false,
      };
    });

  const daysByWeek = new Map<number, string[]>();
  for (const day of days) {
    const arr = daysByWeek.get(day.weekNumber) ?? [];
    arr.push(day.id);
    daysByWeek.set(day.weekNumber, arr);
  }

  const weeks = raw.weeks
    .slice()
    .sort((a, b) => a.weekNumber - b.weekNumber)
    .map((w) => ({
      id: uid("week"),
      weekNumber: w.weekNumber,
      monthNumber: Math.ceil(w.weekNumber / 4),
      title: w.title,
      theme: w.theme,
      focusDomainIds: w.focusDomainIds.filter((id) => validDomainIds.has(id)),
      goals: w.goals,
      dayIds: daysByWeek.get(w.weekNumber) ?? [],
    }));

  const weeksByMonth = new Map<number, string[]>();
  for (const week of weeks) {
    const arr = weeksByMonth.get(week.monthNumber) ?? [];
    arr.push(week.id);
    weeksByMonth.set(week.monthNumber, arr);
  }

  const months = raw.months
    .slice()
    .sort((a, b) => a.monthNumber - b.monthNumber)
    .map((m) => ({
      id: uid("month"),
      monthNumber: m.monthNumber,
      title: m.title,
      theme: m.theme,
      milestone: m.milestone,
      weekIds: weeksByMonth.get(m.monthNumber) ?? [],
    }));

  const totalHours = Math.round(
    days.reduce((sum, d) => sum + d.estimatedHours, 0),
  );

  return {
    id: uid("roadmap"),
    certificationId: cert.id,
    title: raw.title,
    profile,
    generatedBy,
    summary: raw.summary,
    totalDays: days.length,
    totalWeeks: weeks.length,
    totalMonths: months.length,
    totalHours,
    months,
    weeks,
    days,
    createdAt: now,
    updatedAt: now,
  };
}

/** Number of study days between now and the target exam date (min 7). */
export function daysUntil(targetExamDate: string): number {
  const target = new Date(targetExamDate);
  const diff = Math.ceil((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return Math.max(7, Math.min(diff, 365));
}

/** Generate, persist and return a roadmap for the given profile. */
export async function generateRoadmap(
  cert: CertificationConfig,
  profile: UserProfile,
  settings: AppSettings,
): Promise<Roadmap> {
  const provider = createProvider(settings.provider, {
    apiKey: settings.apiKey,
    model: settings.model,
  });
  const totalDays = daysUntil(profile.targetExamDate);
  const raw = await provider.generateRoadmap({ certification: cert, profile, totalDays });
  const roadmap = buildRoadmap(raw, cert, profile, provider.id);
  await roadmapRepo.save(roadmap);
  return roadmap;
}
