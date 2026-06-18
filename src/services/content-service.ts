import { addDays, formatISO } from "date-fns";
import { uid } from "@/lib/utils";
import { createProvider } from "./ai";
import type {
  AppSettings,
  CertificationConfig,
  Difficulty,
  ExamQuestion,
  Flashcard,
  CheatSheet,
  InterviewQuestion,
  InterviewLevel,
  RevisionPlan,
  RevisionWindow,
} from "@/types";
import {
  questionRepo,
  flashcardRepo,
  cheatsheetRepo,
  interviewRepo,
  revisionRepo,
} from "@/database/repositories";

function provider(settings: AppSettings) {
  return createProvider(settings.provider, {
    apiKey: settings.apiKey,
    model: settings.model,
  });
}

/** Stable hash for de-duplicating questions (normalized text). */
function hashQuestion(text: string): string {
  const norm = text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  let h = 0;
  for (let i = 0; i < norm.length; i++) {
    h = (Math.imul(31, h) + norm.charCodeAt(i)) | 0;
  }
  return `q${(h >>> 0).toString(36)}`;
}

// --------------------------------------------------------------- Questions ---
export async function generateQuestions(
  cert: CertificationConfig,
  settings: AppSettings,
  opts: { count: number; difficulty: Difficulty | "mixed"; domainId?: string },
): Promise<{ added: number; total: number }> {
  const existing = await questionRepo.existingHashes(cert.id);
  const raw = await provider(settings).generateQuestions({
    certification: cert,
    count: opts.count,
    difficulty: opts.difficulty,
    domainId: opts.domainId,
  });

  const now = Date.now();
  const mapped: ExamQuestion[] = [];
  for (const q of raw) {
    const hash = hashQuestion(q.question);
    if (existing.has(hash)) continue;
    existing.add(hash);
    const options = q.options.map((text) => ({ id: uid("opt"), text }));
    const correctOptionIds = q.correctIndices
      .filter((i) => i >= 0 && i < options.length)
      .map((i) => options[i].id);
    if (correctOptionIds.length === 0) continue;
    mapped.push({
      id: uid("q"),
      certificationId: cert.id,
      type: q.type,
      difficulty: q.difficulty,
      domainId: q.domainId,
      topic: q.topic,
      question: q.question,
      options,
      correctOptionIds,
      explanation: q.explanation,
      hash,
      createdAt: now,
    });
  }
  const added = await questionRepo.addMany(mapped);
  const total = (await questionRepo.getByCertification(cert.id)).length;
  return { added, total };
}

// -------------------------------------------------------------- Flashcards ---
export async function generateFlashcards(
  cert: CertificationConfig,
  settings: AppSettings,
  opts: { count: number; domainId?: string },
): Promise<Flashcard[]> {
  const raw = await provider(settings).generateFlashcards({
    certification: cert,
    count: opts.count,
    domainId: opts.domainId,
  });
  const now = Date.now();
  const today = formatISO(new Date(), { representation: "date" });
  const cards: Flashcard[] = raw.map((c) => ({
    id: uid("fc"),
    certificationId: cert.id,
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
    createdAt: now,
  }));
  await flashcardRepo.addMany(cards);
  return cards;
}

/**
 * SM-2 inspired spaced-repetition update. `grade` is 0-5 (>=3 is a pass).
 */
export function reviewFlashcard(card: Flashcard, grade: number): Flashcard {
  const srs = { ...card.srs };
  if (grade < 3) {
    srs.repetitions = 0;
    srs.intervalDays = 1;
  } else {
    srs.repetitions += 1;
    if (srs.repetitions === 1) srs.intervalDays = 1;
    else if (srs.repetitions === 2) srs.intervalDays = 6;
    else srs.intervalDays = Math.round(srs.intervalDays * srs.easeFactor);
    srs.easeFactor = Math.max(
      1.3,
      srs.easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)),
    );
  }
  srs.lastReviewedAt = Date.now();
  srs.dueDate = formatISO(addDays(new Date(), srs.intervalDays), {
    representation: "date",
  });
  return { ...card, srs };
}

// ------------------------------------------------------------- Cheat sheets ---
export async function generateCheatSheet(
  cert: CertificationConfig,
  settings: AppSettings,
  topic: string,
): Promise<CheatSheet> {
  const raw = await provider(settings).generateCheatSheet({ certification: cert, topic });
  const sheet: CheatSheet = {
    id: uid("cs"),
    certificationId: cert.id,
    topic: raw.topic || topic,
    definition: raw.definition,
    architecture: raw.architecture,
    useCases: raw.useCases,
    bestPractices: raw.bestPractices,
    commonMistakes: raw.commonMistakes,
    comparisonTables: raw.comparisonTables,
    examTips: raw.examTips,
    interviewTips: raw.interviewTips,
    sections: raw.sections,
    createdAt: Date.now(),
  };
  await cheatsheetRepo.save(sheet);
  return sheet;
}

// ---------------------------------------------------------------- Interview ---
export async function generateInterviewQuestions(
  cert: CertificationConfig,
  settings: AppSettings,
  opts: { count: number; level: InterviewLevel },
): Promise<InterviewQuestion[]> {
  const raw = await provider(settings).generateInterviewQuestions({
    certification: cert,
    count: opts.count,
    level: opts.level,
  });
  const now = Date.now();
  const items: InterviewQuestion[] = raw.map((q) => ({
    id: uid("iv"),
    certificationId: cert.id,
    level: q.level,
    category: q.category,
    question: q.question,
    answer: q.answer,
    followUps: q.followUps,
    createdAt: now,
  }));
  await interviewRepo.addMany(items);
  return items;
}

// ---------------------------------------------------------------- Revision ---
export async function generateRevisionPlan(
  cert: CertificationConfig,
  settings: AppSettings,
  window: RevisionWindow,
): Promise<RevisionPlan> {
  const raw = await provider(settings).generateRevisionPlan({ certification: cert, window });
  const plan: RevisionPlan = {
    id: uid("rev"),
    certificationId: cert.id,
    window,
    title: raw.title,
    summary: raw.summary,
    items: raw.items,
    examDayChecklist: raw.examDayChecklist,
    createdAt: Date.now(),
  };
  await revisionRepo.save(plan);
  return plan;
}
