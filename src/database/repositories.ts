import { getDB } from "./db";
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
 * Repository layer — the only module that talks to Dexie directly. Services and
 * stores depend on these functions, never on Dexie tables, keeping persistence
 * swappable (Repository Pattern).
 */

// ---------------------------------------------------------------- Roadmaps ---
export const roadmapRepo = {
  async getAll(): Promise<Roadmap[]> {
    return getDB().roadmaps.orderBy("updatedAt").reverse().toArray();
  },
  async get(id: string): Promise<Roadmap | undefined> {
    return getDB().roadmaps.get(id);
  },
  async getByCertification(certificationId: string): Promise<Roadmap[]> {
    return getDB().roadmaps.where("certificationId").equals(certificationId).toArray();
  },
  async save(roadmap: Roadmap): Promise<string> {
    return getDB().roadmaps.put(roadmap);
  },
  async update(id: string, patch: Partial<Roadmap>): Promise<void> {
    await getDB().roadmaps.update(id, { ...patch, updatedAt: Date.now() });
  },
  async remove(id: string): Promise<void> {
    const db = getDB();
    await db.transaction(
      "rw",
      [db.roadmaps, db.completions, db.sessions, db.notes],
      async () => {
        await db.roadmaps.delete(id);
        await db.completions.where("roadmapId").equals(id).delete();
        await db.sessions.where("roadmapId").equals(id).delete();
        await db.notes.where("roadmapId").equals(id).delete();
      },
    );
  },
};

// ---------------------------------------------------------------- Settings ---
const SETTINGS_ID = "singleton" as const;

export const settingsRepo = {
  async get(): Promise<AppSettings | undefined> {
    return getDB().settings.get(SETTINGS_ID);
  },
  async save(settings: AppSettings): Promise<void> {
    await getDB().settings.put({ ...settings, id: SETTINGS_ID, updatedAt: Date.now() });
  },
  async update(patch: Partial<AppSettings>): Promise<void> {
    const existing = await this.get();
    const now = Date.now();
    const base: AppSettings = existing ?? {
      id: SETTINGS_ID,
      provider: "groq",
      apiKey: "",
      theme: "system",
      activeRoadmapId: null,
      keyValidatedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    await getDB().settings.put({ ...base, ...patch, id: SETTINGS_ID, updatedAt: now });
  },
};

// --------------------------------------------------------------- Questions ---
export const questionRepo = {
  async getByCertification(certificationId: string): Promise<ExamQuestion[]> {
    return getDB().questions.where("certificationId").equals(certificationId).toArray();
  },
  async existingHashes(certificationId: string): Promise<Set<string>> {
    const items = await this.getByCertification(certificationId);
    return new Set(items.map((q) => q.hash));
  },
  /** Bulk add, silently skipping duplicates by unique hash. */
  async addMany(questions: ExamQuestion[]): Promise<number> {
    let added = 0;
    await getDB().transaction("rw", getDB().questions, async () => {
      for (const q of questions) {
        try {
          await getDB().questions.add(q);
          added++;
        } catch {
          /* duplicate hash — skip */
        }
      }
    });
    return added;
  },
  async remove(id: string): Promise<void> {
    await getDB().questions.delete(id);
  },
};

// -------------------------------------------------------------- Flashcards ---
export const flashcardRepo = {
  async getByCertification(certificationId: string): Promise<Flashcard[]> {
    return getDB().flashcards.where("certificationId").equals(certificationId).toArray();
  },
  async dueToday(certificationId: string): Promise<Flashcard[]> {
    const today = new Date().toISOString().slice(0, 10);
    const all = await this.getByCertification(certificationId);
    return all.filter((c) => c.srs.dueDate <= today);
  },
  async addMany(cards: Flashcard[]): Promise<void> {
    await getDB().flashcards.bulkPut(cards);
  },
  async update(id: string, patch: Partial<Flashcard>): Promise<void> {
    await getDB().flashcards.update(id, patch);
  },
};

// ------------------------------------------------------------- Cheat sheets ---
export const cheatsheetRepo = {
  async getByCertification(certificationId: string): Promise<CheatSheet[]> {
    return getDB().cheatsheets.where("certificationId").equals(certificationId).toArray();
  },
  async save(sheet: CheatSheet): Promise<void> {
    await getDB().cheatsheets.put(sheet);
  },
  async remove(id: string): Promise<void> {
    await getDB().cheatsheets.delete(id);
  },
};

// ---------------------------------------------------------------- Interview ---
export const interviewRepo = {
  async getByCertification(certificationId: string): Promise<InterviewQuestion[]> {
    return getDB().interviews.where("certificationId").equals(certificationId).toArray();
  },
  async addMany(items: InterviewQuestion[]): Promise<void> {
    await getDB().interviews.bulkPut(items);
  },
};

// ---------------------------------------------------------------- Revisions ---
export const revisionRepo = {
  async getByCertification(certificationId: string): Promise<RevisionPlan[]> {
    return getDB().revisions.where("certificationId").equals(certificationId).toArray();
  },
  async save(plan: RevisionPlan): Promise<void> {
    await getDB().revisions.put(plan);
  },
};

// ----------------------------------------------------------------- Progress ---
export const progressRepo = {
  async completionsForRoadmap(roadmapId: string): Promise<DayCompletion[]> {
    return getDB().completions.where("roadmapId").equals(roadmapId).toArray();
  },
  async setDayCompletion(c: DayCompletion): Promise<void> {
    await getDB().completions.put(c);
  },
  async sessionsForRoadmap(roadmapId: string): Promise<StudySession[]> {
    return getDB().sessions.where("roadmapId").equals(roadmapId).toArray();
  },
  async addSession(s: StudySession): Promise<void> {
    await getDB().sessions.put(s);
  },
  async attemptsForCertification(certificationId: string): Promise<QuizAttempt[]> {
    return getDB().attempts.where("certificationId").equals(certificationId).toArray();
  },
  async addAttempt(a: QuizAttempt): Promise<void> {
    await getDB().attempts.put(a);
  },
};

// ---------------------------------------------------------------- Seed state ---
export const seedRepo = {
  async getVersion(certificationId: string): Promise<number> {
    const rec = await getDB().seedState.get(certificationId);
    return rec?.version ?? 0;
  },
  async setVersion(certificationId: string, version: number): Promise<void> {
    await getDB().seedState.put({ certificationId, version });
  },
  /**
   * Remove previously-seeded rows for a certification (ids prefixed `seed_`),
   * leaving the user's own AI-generated and edited content untouched. Used when
   * applying a newer content-pack version so corrections propagate.
   */
  async clearSeeded(certificationId: string): Promise<void> {
    const db = getDB();
    const prefix = `seed_${certificationId}_`;
    const isSeed = (id: string) => id.startsWith(prefix);
    await db.transaction("rw", [db.questions, db.flashcards, db.cheatsheets], async () => {
      await db.questions.where("certificationId").equals(certificationId).and((q) => isSeed(q.id)).delete();
      await db.flashcards.where("certificationId").equals(certificationId).and((c) => isSeed(c.id)).delete();
      await db.cheatsheets.where("certificationId").equals(certificationId).and((s) => isSeed(s.id)).delete();
    });
  },
};

// -------------------------------------------------------------------- Notes ---
export const noteRepo = {
  async forRoadmap(roadmapId: string): Promise<Note[]> {
    return getDB().notes.where("roadmapId").equals(roadmapId).toArray();
  },
  async save(note: Note): Promise<void> {
    await getDB().notes.put(note);
  },
  async remove(id: string): Promise<void> {
    await getDB().notes.delete(id);
  },
};
