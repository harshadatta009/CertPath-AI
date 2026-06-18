import type { UserProfile } from "./profile";

export interface HandsOnLab {
  title: string;
  description: string;
  estimatedMinutes: number;
}

/** A single day of study. */
export interface RoadmapDay {
  id: string;
  /** 1-based absolute day index across the whole plan. */
  dayNumber: number;
  /** Week number this day belongs to (1-based). */
  weekNumber: number;
  /** Month number this day belongs to (1-based). */
  monthNumber: number;
  /** ISO date for this study day. */
  date: string;
  title: string;
  /** Domain id from the certification config this day focuses on. */
  domainId: string;
  topics: string[];
  objectives: string[];
  estimatedHours: number;
  labs: HandsOnLab[];
  /** Topics from previous days to revise today. */
  revisionTopics: string[];
  /** Number of practice questions recommended. */
  practiceQuestions: number;
  examTips: string[];
  completed: boolean;
}

export interface RoadmapWeek {
  id: string;
  weekNumber: number;
  monthNumber: number;
  title: string;
  theme: string;
  focusDomainIds: string[];
  goals: string[];
  dayIds: string[];
}

export interface RoadmapMonth {
  id: string;
  monthNumber: number;
  title: string;
  theme: string;
  milestone: string;
  weekIds: string[];
}

export interface Roadmap {
  id: string;
  certificationId: string;
  /** Display title, e.g. "AWS SAA-C03 — 8 Week Plan". */
  title: string;
  /** Snapshot of the profile used to generate this roadmap. */
  profile: UserProfile;
  /** Provider used to generate, e.g. "grok". */
  generatedBy: string;
  summary: string;
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
  totalHours: number;
  months: RoadmapMonth[];
  weeks: RoadmapWeek[];
  days: RoadmapDay[];
  createdAt: number;
  updatedAt: number;
}
