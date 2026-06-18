/** Learning content entities: questions, flashcards, cheat sheets, interview, revision. */

export type Difficulty = "easy" | "medium" | "hard";
export type QuestionType = "mcq" | "multi-select" | "scenario";

export interface QuestionOption {
  id: string;
  text: string;
}

export interface ExamQuestion {
  id: string;
  certificationId: string;
  type: QuestionType;
  difficulty: Difficulty;
  domainId: string;
  topic: string;
  question: string;
  options: QuestionOption[];
  /** Ids of correct option(s). */
  correctOptionIds: string[];
  explanation: string;
  /** Hash used to de-duplicate generated questions. */
  hash: string;
  /** True when sourced from the community-reviewed seed content (not AI). */
  verified?: boolean;
  createdAt: number;
}

export interface Flashcard {
  id: string;
  certificationId: string;
  category: string;
  difficulty: Difficulty;
  question: string;
  answer: string;
  bookmarked: boolean;
  /** Spaced-repetition (SM-2 inspired) metadata. */
  srs: {
    repetitions: number;
    easeFactor: number;
    intervalDays: number;
    /** ISO date of next review. */
    dueDate: string;
    lastReviewedAt: number | null;
  };
  /** True when sourced from the community-reviewed seed content (not AI). */
  verified?: boolean;
  createdAt: number;
}

export interface CheatSheetSection {
  heading: string;
  body: string;
}

export interface ComparisonTable {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface CheatSheet {
  id: string;
  certificationId: string;
  topic: string;
  definition: string;
  architecture: string;
  useCases: string[];
  bestPractices: string[];
  commonMistakes: string[];
  comparisonTables: ComparisonTable[];
  examTips: string[];
  interviewTips: string[];
  sections: CheatSheetSection[];
  /** True when sourced from the community-reviewed seed content (not AI). */
  verified?: boolean;
  createdAt: number;
}

export type InterviewLevel = "beginner" | "intermediate" | "advanced";
export type InterviewCategory =
  | "technical"
  | "system-design"
  | "behavioral"
  | "scenario";

export interface InterviewQuestion {
  id: string;
  certificationId: string;
  level: InterviewLevel;
  category: InterviewCategory;
  question: string;
  answer: string;
  followUps: string[];
  createdAt: number;
}

export type RevisionWindow =
  | "30-day"
  | "15-day"
  | "7-day"
  | "last-week"
  | "48-hours"
  | "24-hours"
  | "exam-day";

export interface RevisionItem {
  topic: string;
  domainId: string;
  keyPoints: string[];
  estimatedMinutes: number;
}

export interface RevisionPlan {
  id: string;
  certificationId: string;
  window: RevisionWindow;
  title: string;
  summary: string;
  items: RevisionItem[];
  examDayChecklist: string[];
  createdAt: number;
}
