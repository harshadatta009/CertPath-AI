/**
 * Certification configuration types.
 *
 * A certification is described entirely by a configuration object. Adding a new
 * certification requires creating ONE new config file and registering it — no
 * changes to the engines, UI, or storage layer.
 */

export type CertificationProvider =
  | "aws"
  | "azure"
  | "gcp"
  | "kubernetes"
  | "hashicorp"
  | "redhat"
  | "comptia"
  | "cisco";

export interface CertTopic {
  id: string;
  name: string;
  /** Optional short description to seed AI prompts. */
  description?: string;
  /** Relative effort hint (1-5). Used to distribute study hours. */
  weight?: number;
}

export interface CertDomain {
  id: string;
  name: string;
  /** Exam weightage as a percentage (domains should sum ~100). */
  weightage: number;
  /** Recommended study hours for this domain at intermediate level. */
  recommendedHours: number;
  topics: CertTopic[];
}

export interface ExamMetadata {
  /** Number of questions on the real exam. */
  questionCount: number;
  /** Duration in minutes. */
  durationMinutes: number;
  /** Passing score (provider scale, e.g. 720/1000 for AWS). */
  passingScore: number;
  /** Max score on the provider scale. */
  maxScore: number;
  /** Price in USD. */
  priceUsd: number;
  /** Question formats present on the exam. */
  formats: Array<"mcq" | "multi-select" | "scenario">;
  /** Validity in years. */
  validityYears: number;
}

export interface CertificationConfig {
  /** Stable unique id, e.g. "aws-saa-c03". */
  id: string;
  /** Provider/vendor. */
  provider: CertificationProvider;
  /** Short code, e.g. "SAA-C03". */
  code: string;
  /** Display name. */
  name: string;
  /** One-line marketing description. */
  tagline: string;
  /** Longer description. */
  description: string;
  /** Difficulty tier. */
  level: "foundational" | "associate" | "professional" | "specialty";
  /** Brand accent color (hex) used for cards. */
  color: string;
  /** Total recommended preparation hours (intermediate baseline). */
  recommendedHours: number;
  domains: CertDomain[];
  exam: ExamMetadata;
  /** Tags for filtering/search. */
  tags: string[];
  /** Whether the config is fully implemented and selectable. */
  available: boolean;
}
