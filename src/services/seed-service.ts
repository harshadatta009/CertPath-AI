import { formatISO } from "date-fns";
import { CONTENT_PACKS, getContentPack } from "@/content";
import type { ContentPack } from "@/content";
import type { ExamQuestion, Flashcard, CheatSheet } from "@/types";
import {
  questionRepo,
  flashcardRepo,
  cheatsheetRepo,
  seedRepo,
} from "@/database/repositories";

/**
 * Seeds community-reviewed content into IndexedDB so the app is fully useful
 * without an API key. Idempotent: a pack is applied only when its `version` is
 * newer than what's recorded for that certification, and all generated ids are
 * stable/deterministic so re-running never creates duplicates.
 */

/** Deterministic stable hash for a string (mirrors the question hash format). */
function stableHash(text: string): string {
  const norm = text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  let h = 0;
  for (let i = 0; i < norm.length; i++) {
    h = (Math.imul(31, h) + norm.charCodeAt(i)) | 0;
  }
  return `q${(h >>> 0).toString(36)}`;
}

function expandPack(pack: ContentPack): {
  questions: ExamQuestion[];
  flashcards: Flashcard[];
  cheatSheets: CheatSheet[];
} {
  const cert = pack.certificationId;
  // Fixed timestamp base keeps ordering stable without using Date.now() per item.
  const now = Date.now();
  const today = formatISO(new Date(), { representation: "date" });

  const questions: ExamQuestion[] = pack.questions.map((q, i) => {
    const id = `seed_${cert}_q${i}`;
    const options = q.options.map((text, oi) => ({ id: `${id}_o${oi}`, text }));
    return {
      id,
      certificationId: cert,
      type: q.type,
      difficulty: q.difficulty,
      domainId: q.domainId,
      topic: q.topic,
      question: q.question,
      options,
      correctOptionIds: q.correctIndices
        .filter((ci) => ci >= 0 && ci < options.length)
        .map((ci) => options[ci].id),
      explanation: q.explanation,
      hash: stableHash(q.question),
      verified: true,
      createdAt: now,
    };
  });

  const flashcards: Flashcard[] = pack.flashcards.map((c, i) => ({
    id: `seed_${cert}_fc${i}`,
    certificationId: cert,
    category: c.category,
    difficulty: c.difficulty,
    question: c.question,
    answer: c.answer,
    bookmarked: false,
    srs: {
      repetitions: 0,
      easeFactor: 2.5,
      intervalDays: 0,
      dueDate: today,
      lastReviewedAt: null,
    },
    verified: true,
    createdAt: now,
  }));

  const cheatSheets: CheatSheet[] = pack.cheatSheets.map((s, i) => ({
    id: `seed_${cert}_cs${i}`,
    certificationId: cert,
    topic: s.topic,
    definition: s.definition,
    architecture: s.architecture,
    useCases: s.useCases,
    bestPractices: s.bestPractices,
    commonMistakes: s.commonMistakes,
    comparisonTables: s.comparisonTables,
    examTips: s.examTips,
    interviewTips: s.interviewTips,
    sections: s.sections ?? [],
    verified: true,
    createdAt: now,
  }));

  return { questions, flashcards, cheatSheets };
}

/** Seed a single certification's pack if a newer version is available. */
export async function seedCertification(certificationId: string): Promise<boolean> {
  const pack = getContentPack(certificationId);
  if (!pack) return false;

  const applied = await seedRepo.getVersion(certificationId);
  if (applied >= pack.version) return false;

  // On an upgrade, clear the previously-seeded rows so corrections propagate.
  if (applied > 0) await seedRepo.clearSeeded(certificationId);

  const { questions, flashcards, cheatSheets } = expandPack(pack);

  // questionRepo.addMany dedups on the unique hash; bulkPut on stable ids is
  // idempotent for flashcards/cheat sheets.
  await questionRepo.addMany(questions);
  await flashcardRepo.addMany(flashcards);
  for (const sheet of cheatSheets) await cheatsheetRepo.save(sheet);

  await seedRepo.setVersion(certificationId, pack.version);
  return true;
}

/** Seed all registered content packs. Safe to call on every app load. */
export async function seedAllContent(): Promise<void> {
  for (const pack of CONTENT_PACKS) {
    try {
      await seedCertification(pack.certificationId);
    } catch (err) {
      // Never block app startup on seeding.
      console.warn(`Seeding failed for ${pack.certificationId}`, err);
    }
  }
}
