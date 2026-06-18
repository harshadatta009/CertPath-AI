/** Progress, notes, analytics and settings entities. */

export interface DayCompletion {
  id: string;
  roadmapId: string;
  dayId: string;
  completed: boolean;
  completedAt: number | null;
  /** Actual hours the user logged for the day. */
  actualHours: number;
}

export interface StudySession {
  id: string;
  roadmapId: string;
  /** ISO date (yyyy-MM-dd) of the session. */
  date: string;
  hours: number;
  createdAt: number;
}

export interface QuizAttempt {
  id: string;
  certificationId: string;
  questionId: string;
  domainId: string;
  difficulty: "easy" | "medium" | "hard";
  correct: boolean;
  createdAt: number;
}

export interface Note {
  id: string;
  roadmapId: string;
  /** Optional day this note is attached to. */
  dayId?: string;
  title: string;
  body: string;
  createdAt: number;
  updatedAt: number;
}

export interface DomainScore {
  domainId: string;
  domainName: string;
  /** 0-100 mastery for this domain. */
  score: number;
  attempts: number;
}

export interface AnalyticsSnapshot {
  /** 0-100 overall readiness. */
  readinessScore: number;
  /** 0-100 roadmap completion. */
  completion: number;
  /** 0-1 predicted probability of passing. */
  passProbability: number;
  /** Current consecutive-day study streak. */
  studyStreak: number;
  /** 0-100 consistency over the trailing window. */
  consistency: number;
  totalStudyHours: number;
  weakDomains: DomainScore[];
  strongDomains: DomainScore[];
  recommendedTopics: string[];
}

export type AIProviderId = "groq" | "grok" | "openai" | "claude" | "gemini";

export interface AppSettings {
  id: "singleton";
  provider: AIProviderId;
  /** API key — stored locally only. */
  apiKey: string;
  /** Optional custom model override. */
  model?: string;
  theme: "light" | "dark" | "system";
  /** Active roadmap id, for quick resume. */
  activeRoadmapId: string | null;
  /** Last successful key validation timestamp. */
  keyValidatedAt: number | null;
  createdAt: number;
  updatedAt: number;
}
