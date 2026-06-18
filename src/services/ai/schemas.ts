import { z } from "zod";

/**
 * Zod schemas describing the RAW JSON we require from the LLM. They intentionally
 * exclude ids/timestamps/hashes — the service layer adds those deterministically.
 * Every provider response is validated against these before being persisted, and
 * invalid responses trigger a retry.
 */

const difficulty = z.enum(["easy", "medium", "hard"]);

// ----------------------------------------------------------------- Roadmap ---
export const rawLabSchema = z.object({
  title: z.string(),
  description: z.string(),
  estimatedMinutes: z.number().int().positive().max(600),
});

export const rawDaySchema = z.object({
  dayNumber: z.number().int().positive(),
  title: z.string(),
  domainId: z.string(),
  topics: z.array(z.string()).min(1),
  objectives: z.array(z.string()).min(1),
  estimatedHours: z.number().positive().max(16),
  labs: z.array(rawLabSchema).default([]),
  revisionTopics: z.array(z.string()).default([]),
  practiceQuestions: z.number().int().min(0).max(200).default(0),
  examTips: z.array(z.string()).default([]),
});

export const rawWeekSchema = z.object({
  weekNumber: z.number().int().positive(),
  title: z.string(),
  theme: z.string(),
  focusDomainIds: z.array(z.string()).default([]),
  goals: z.array(z.string()).default([]),
});

export const rawMonthSchema = z.object({
  monthNumber: z.number().int().positive(),
  title: z.string(),
  theme: z.string(),
  milestone: z.string(),
});

export const rawRoadmapSchema = z.object({
  title: z.string(),
  summary: z.string(),
  months: z.array(rawMonthSchema).min(1),
  weeks: z.array(rawWeekSchema).min(1),
  days: z.array(rawDaySchema).min(1),
});
export type RawRoadmap = z.infer<typeof rawRoadmapSchema>;
export type RawDay = z.infer<typeof rawDaySchema>;
export type RawWeek = z.infer<typeof rawWeekSchema>;

/**
 * Chunked generation contracts: an outline (title/summary/weeks/months, no days)
 * plus per-batch day lists. This keeps each model response small so even modest
 * models reliably return complete, well-formed output for long plans.
 */
export const rawRoadmapOutlineSchema = z.object({
  title: z.string(),
  summary: z.string(),
  months: z.array(rawMonthSchema).min(1),
  weeks: z.array(rawWeekSchema).min(1),
});
export type RawRoadmapOutline = z.infer<typeof rawRoadmapOutlineSchema>;

export const rawRoadmapDaysSchema = z.object({
  days: z.array(rawDaySchema).min(1),
});

// --------------------------------------------------------------- Questions ---
export const rawQuestionSchema = z.object({
  type: z.enum(["mcq", "multi-select", "scenario"]),
  difficulty,
  domainId: z.string(),
  topic: z.string(),
  question: z.string(),
  options: z.array(z.string()).min(2).max(6),
  /** Indices (0-based) into `options` that are correct. */
  correctIndices: z.array(z.number().int().min(0)).min(1),
  explanation: z.string(),
});
export const rawQuestionsSchema = z.object({
  questions: z.array(rawQuestionSchema).min(1),
});
export type RawQuestion = z.infer<typeof rawQuestionSchema>;

// -------------------------------------------------------------- Flashcards ---
export const rawFlashcardSchema = z.object({
  category: z.string(),
  difficulty,
  question: z.string(),
  answer: z.string(),
});
export const rawFlashcardsSchema = z.object({
  flashcards: z.array(rawFlashcardSchema).min(1),
});
export type RawFlashcard = z.infer<typeof rawFlashcardSchema>;

// ------------------------------------------------------------- Cheat sheet ---
export const rawComparisonSchema = z.object({
  title: z.string(),
  headers: z.array(z.string()).min(2),
  rows: z.array(z.array(z.string()).min(2)).min(1),
});
export const rawCheatSheetSchema = z.object({
  topic: z.string(),
  definition: z.string(),
  architecture: z.string(),
  useCases: z.array(z.string()).default([]),
  bestPractices: z.array(z.string()).default([]),
  commonMistakes: z.array(z.string()).default([]),
  comparisonTables: z.array(rawComparisonSchema).default([]),
  examTips: z.array(z.string()).default([]),
  interviewTips: z.array(z.string()).default([]),
  sections: z
    .array(z.object({ heading: z.string(), body: z.string() }))
    .default([]),
});
export type RawCheatSheet = z.infer<typeof rawCheatSheetSchema>;

// ---------------------------------------------------------------- Interview ---
export const rawInterviewSchema = z.object({
  level: z.enum(["beginner", "intermediate", "advanced"]),
  category: z.enum(["technical", "system-design", "behavioral", "scenario"]),
  question: z.string(),
  answer: z.string(),
  followUps: z.array(z.string()).default([]),
});
export const rawInterviewListSchema = z.object({
  questions: z.array(rawInterviewSchema).min(1),
});
export type RawInterview = z.infer<typeof rawInterviewSchema>;

// ---------------------------------------------------------------- Revision ---
export const rawRevisionItemSchema = z.object({
  topic: z.string(),
  domainId: z.string(),
  keyPoints: z.array(z.string()).min(1),
  estimatedMinutes: z.number().int().positive().max(600),
});
export const rawRevisionPlanSchema = z.object({
  title: z.string(),
  summary: z.string(),
  items: z.array(rawRevisionItemSchema).min(1),
  examDayChecklist: z.array(z.string()).default([]),
});
export type RawRevisionPlan = z.infer<typeof rawRevisionPlanSchema>;
