import { addDays, formatISO } from "date-fns";
import { uid } from "@/lib/utils";
import { createProvider } from "./ai";
import { toAIError } from "./ai/errors";
import type { AppSettings } from "@/types";
import type { CertificationConfig, UserProfile, Roadmap, RoadmapDay } from "@/types";
import type { RawRoadmap, RawDay, RawWeek } from "./ai/schemas";
import { roadmapRepo } from "@/database/repositories";

/** Progress callback fired as each batch of the roadmap is generated. */
export type RoadmapProgress = (message: string, fraction: number) => void;

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

/** Inclusive day numbers covered by a week (7-day weeks). */
function weekOverlapsRange(weekNumber: number, start: number, end: number): boolean {
  const weekStart = (weekNumber - 1) * 7 + 1;
  const weekEnd = weekNumber * 7;
  return weekStart <= end && weekEnd >= start;
}

/** A light, valid filler day used only if a model under-delivers a batch. */
export function fallbackDay(
  dayNumber: number,
  cert: CertificationConfig,
  weeks: RawWeek[],
  profile: UserProfile,
): RawDay {
  const weekNumber = Math.ceil(dayNumber / 7);
  const week = weeks.find((w) => w.weekNumber === weekNumber);
  const domainId =
    week?.focusDomainIds?.[0] && cert.domains.some((d) => d.id === week.focusDomainIds![0])
      ? week.focusDomainIds![0]
      : cert.domains[0]?.id ?? "";
  const domain = cert.domains.find((d) => d.id === domainId);
  const topics = domain?.topics.slice(0, 2).map((t) => t.name) ?? ["Review key concepts"];
  return {
    dayNumber,
    title: week ? `${week.theme} — review & practice` : "Review & practice",
    domainId,
    topics,
    objectives: ["Reinforce the week's topics", "Close knowledge gaps with practice"],
    estimatedHours: Math.max(0.5, profile.dailyStudyHours),
    labs: [],
    revisionTopics: topics,
    practiceQuestions: 15,
    examTips: ["Revisit any topic you scored low on in practice questions."],
  };
}

/**
 * Normalize one generated batch to EXACTLY the days [start, end]: positions are
 * renumbered deterministically and any shortfall is filled with fallback days,
 * so coverage is guaranteed regardless of how many days the model returned.
 */
export function normalizeDayChunk(
  rawDays: RawDay[],
  start: number,
  end: number,
  makeFallback: (dayNumber: number) => RawDay,
): RawDay[] {
  const expected = end - start + 1;
  const sorted = [...rawDays]
    .filter((d) => d && Array.isArray(d.topics) && d.topics.length > 0)
    .sort((a, b) => a.dayNumber - b.dayNumber);
  const out: RawDay[] = [];
  for (let i = 0; i < expected; i++) {
    const dayNumber = start + i;
    const src = sorted[i];
    out.push(src ? { ...src, dayNumber } : makeFallback(dayNumber));
  }
  return out;
}

/** Days per generation batch (one model call). Smaller batches = more reliable. */
const DAY_BATCH = 7;

/**
 * Generate, persist and return a roadmap using chunked generation: a small
 * outline call, then one call per ~week of days. This keeps every model
 * response small enough to be complete and well-formed even on lighter models,
 * and guarantees the full day range is covered.
 */
export async function generateRoadmap(
  cert: CertificationConfig,
  profile: UserProfile,
  settings: AppSettings,
  onProgress?: RoadmapProgress,
): Promise<Roadmap> {
  const provider = createProvider(settings.provider, {
    apiKey: settings.apiKey,
    model: settings.model,
  });
  const totalDays = daysUntil(profile.targetExamDate);

  onProgress?.("Designing your plan outline…", 0.05);
  const outline = await provider.generateRoadmapOutline({
    certification: cert,
    profile,
    totalDays,
  });

  const batches: Array<{ start: number; end: number }> = [];
  for (let start = 1; start <= totalDays; start += DAY_BATCH) {
    batches.push({ start, end: Math.min(start + DAY_BATCH - 1, totalDays) });
  }

  const allDays: RawDay[] = [];
  for (let i = 0; i < batches.length; i++) {
    const { start, end } = batches[i];
    onProgress?.(
      `Generating days ${start}–${end} (batch ${i + 1}/${batches.length})…`,
      0.1 + (0.85 * i) / batches.length,
    );
    const relevantWeeks = outline.weeks.filter((w) => weekOverlapsRange(w.weekNumber, start, end));
    let chunk: RawDay[] = [];
    try {
      chunk = await provider.generateRoadmapDays({
        certification: cert,
        profile,
        totalDays,
        startDay: start,
        endDay: end,
        weeks: relevantWeeks,
      });
    } catch (err) {
      // A failed auth/network error should abort; a content failure falls back.
      const e = toAIError(err);
      if (e.code === "invalid_key" || e.code === "rate_limit") throw e;
      chunk = [];
    }
    allDays.push(
      ...normalizeDayChunk(chunk, start, end, (n) => fallbackDay(n, cert, outline.weeks, profile)),
    );
  }

  onProgress?.("Finalizing your roadmap…", 0.98);
  const raw: RawRoadmap = {
    title: outline.title,
    summary: outline.summary,
    months: outline.months,
    weeks: outline.weeks,
    days: allDays,
  };
  const roadmap = buildRoadmap(raw, cert, profile, provider.id);
  await roadmapRepo.save(roadmap);
  return roadmap;
}
