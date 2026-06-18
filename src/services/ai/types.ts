import type { CertificationConfig, UserProfile } from "@/types";
import type {
  RawRoadmap,
  RawRoadmapOutline,
  RawDay,
  RawWeek,
  RawQuestion,
  RawFlashcard,
  RawCheatSheet,
  RawInterview,
  RawRevisionPlan,
} from "./schemas";
import type { AIProviderId, Difficulty, InterviewLevel, RevisionWindow } from "@/types";

/** Context shared by every generation call. */
export interface GenerationContext {
  certification: CertificationConfig;
}

export interface RoadmapRequest extends GenerationContext {
  profile: UserProfile;
  totalDays: number;
}

/** Outline-only generation (title/summary/weeks/months, no days). */
export interface RoadmapOutlineRequest extends GenerationContext {
  profile: UserProfile;
  totalDays: number;
}

/** Generate only the days in [startDay, endDay], given week-level context. */
export interface RoadmapDaysRequest extends GenerationContext {
  profile: UserProfile;
  totalDays: number;
  startDay: number;
  endDay: number;
  /** Week summaries overlapping this range, for thematic consistency. */
  weeks: RawWeek[];
}

export interface QuestionRequest extends GenerationContext {
  count: number;
  difficulty: Difficulty | "mixed";
  /** Optional domain to focus on. */
  domainId?: string;
  /** Question hashes to avoid regenerating. */
  avoid?: string[];
}

export interface FlashcardRequest extends GenerationContext {
  count: number;
  domainId?: string;
}

export interface CheatSheetRequest extends GenerationContext {
  topic: string;
}

export interface InterviewRequest extends GenerationContext {
  count: number;
  level: InterviewLevel;
}

export interface RevisionRequest extends GenerationContext {
  window: RevisionWindow;
}

/**
 * The provider contract. Every concrete provider (Grok today; OpenAI, Claude,
 * Gemini next) implements this exact interface, so the rest of the app is
 * provider-agnostic (Dependency Inversion).
 */
export interface AIProvider {
  readonly id: AIProviderId;
  readonly label: string;
  /** Default model used when settings.model is empty. */
  readonly defaultModel: string;

  /** Returns true if the key authenticates successfully. */
  validateKey(): Promise<boolean>;

  generateRoadmap(req: RoadmapRequest): Promise<RawRoadmap>;
  /** Chunked generation: outline first, then day batches (reliable on any model). */
  generateRoadmapOutline(req: RoadmapOutlineRequest): Promise<RawRoadmapOutline>;
  generateRoadmapDays(req: RoadmapDaysRequest): Promise<RawDay[]>;
  generateQuestions(req: QuestionRequest): Promise<RawQuestion[]>;
  generateFlashcards(req: FlashcardRequest): Promise<RawFlashcard[]>;
  generateCheatSheet(req: CheatSheetRequest): Promise<RawCheatSheet>;
  generateInterviewQuestions(req: InterviewRequest): Promise<RawInterview[]>;
  generateRevisionPlan(req: RevisionRequest): Promise<RawRevisionPlan>;
}

export interface ProviderConfig {
  apiKey: string;
  model?: string;
}
