import type {
  Difficulty,
  QuestionType,
  ComparisonTable,
  CheatSheetSection,
} from "@/types";

/**
 * Community-reviewed seed content.
 *
 * These are plain, human-authored data files that live in the repository and go
 * through pull-request review (see docs/CONTENT.md). On first load they are
 * seeded into IndexedDB so the app is fully useful **without any API key** — the
 * AI only augments this trusted base. Authors write the simple shapes below;
 * the seed service expands them into full entities with stable, deterministic
 * ids so re-seeding never duplicates.
 */

export interface SeedQuestion {
  type: QuestionType;
  difficulty: Difficulty;
  /** Must match a domain id in the certification config. */
  domainId: string;
  topic: string;
  question: string;
  options: string[];
  /** 0-based indices into `options` that are correct. */
  correctIndices: number[];
  explanation: string;
}

export interface SeedFlashcard {
  category: string;
  difficulty: Difficulty;
  question: string;
  answer: string;
}

export interface SeedCheatSheet {
  topic: string;
  definition: string;
  architecture: string;
  useCases: string[];
  bestPractices: string[];
  commonMistakes: string[];
  comparisonTables: ComparisonTable[];
  examTips: string[];
  interviewTips: string[];
  sections?: CheatSheetSection[];
}

export interface ContentPack {
  /** Certification id this content belongs to (must exist in the registry). */
  certificationId: string;
  /**
   * Bump this whenever the pack changes. The seeder re-applies a pack only when
   * its version is newer than what's already been seeded on the device.
   */
  version: number;
  /** GitHub handles of contributors/reviewers, for credit. */
  contributors?: string[];
  questions: SeedQuestion[];
  flashcards: SeedFlashcard[];
  cheatSheets: SeedCheatSheet[];
}
