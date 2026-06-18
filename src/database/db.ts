import Dexie, { type Table } from "dexie";
import type {
  Roadmap,
  ExamQuestion,
  Flashcard,
  CheatSheet,
  InterviewQuestion,
  RevisionPlan,
  DayCompletion,
  StudySession,
  QuizAttempt,
  Note,
  AppSettings,
} from "@/types";

/**
 * CertPathDB — the single IndexedDB instance backing the whole app.
 *
 * All persistence flows through here via the repository layer. There is no
 * server database; everything survives refreshes and restarts and is only
 * cleared when the user wipes browser storage or deletes a roadmap.
 */
export class CertPathDB extends Dexie {
  roadmaps!: Table<Roadmap, string>;
  questions!: Table<ExamQuestion, string>;
  flashcards!: Table<Flashcard, string>;
  cheatsheets!: Table<CheatSheet, string>;
  interviews!: Table<InterviewQuestion, string>;
  revisions!: Table<RevisionPlan, string>;
  completions!: Table<DayCompletion, string>;
  sessions!: Table<StudySession, string>;
  attempts!: Table<QuizAttempt, string>;
  notes!: Table<Note, string>;
  settings!: Table<AppSettings, string>;
  /** Tracks which seed-content pack version has been applied per certification. */
  seedState!: Table<{ certificationId: string; version: number }, string>;

  constructor() {
    super("certpath-ai");
    this.version(1).stores({
      roadmaps: "id, certificationId, createdAt, updatedAt",
      questions: "id, certificationId, domainId, difficulty, &hash, createdAt",
      flashcards: "id, certificationId, category, difficulty, bookmarked, srs.dueDate, createdAt",
      cheatsheets: "id, certificationId, topic, createdAt",
      interviews: "id, certificationId, level, category, createdAt",
      revisions: "id, certificationId, window, createdAt",
      completions: "id, roadmapId, dayId, completed, completedAt",
      sessions: "id, roadmapId, date, createdAt",
      attempts: "id, certificationId, questionId, domainId, createdAt",
      notes: "id, roadmapId, dayId, updatedAt",
      settings: "id",
    });
    // v2 adds seed-content bookkeeping. Existing tables carry over unchanged.
    this.version(2).stores({
      seedState: "certificationId",
    });
  }
}

let _db: CertPathDB | null = null;

/** Lazily create the DB only in the browser (avoids SSR access). */
export function getDB(): CertPathDB {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB is only available in the browser.");
  }
  if (!_db) _db = new CertPathDB();
  return _db;
}
