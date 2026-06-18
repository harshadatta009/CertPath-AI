export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export type KnowledgeLevel = "none" | "basic" | "moderate" | "strong";

/** User-supplied inputs that drive roadmap generation. */
export interface UserProfile {
  /** Years of professional experience. */
  yearsExperience: number;
  /** Current job role, free text. */
  currentRole: string;
  /** Self-assessed knowledge of the target domain. */
  knowledgeLevel: KnowledgeLevel;
  /** Derived experience tier used by the AI. */
  experienceLevel: ExperienceLevel;
  /** Hours the user can study per day. */
  dailyStudyHours: number;
  /** ISO date string of the target exam. */
  targetExamDate: string;
  /** Certification config id being targeted. */
  certificationId: string;
  /** Desired exam score on the provider scale. */
  goalScore: number;
  /** Optional notes / focus areas. */
  notes?: string;
}
