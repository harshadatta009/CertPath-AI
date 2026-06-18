import { describe, it, expect, beforeEach } from "vitest";
import { seedCertification } from "@/services/seed-service";
import { getContentPack } from "@/content";
import { questionRepo, flashcardRepo, cheatsheetRepo, seedRepo } from "@/database/repositories";
import { getDB } from "@/database/db";

const CERT = "aws-saa-c03";

describe("seed-service", () => {
  beforeEach(async () => {
    const db = getDB();
    await Promise.all([
      db.questions.clear(),
      db.flashcards.clear(),
      db.cheatsheets.clear(),
      db.seedState.clear(),
    ]);
  });

  it("seeds verified content for AWS SAA-C03 and is idempotent", async () => {
    const pack = getContentPack(CERT)!;
    expect(pack).toBeTruthy();

    const first = await seedCertification(CERT);
    expect(first).toBe(true);

    const questions = await questionRepo.getByCertification(CERT);
    const flashcards = await flashcardRepo.getByCertification(CERT);
    const sheets = await cheatsheetRepo.getByCertification(CERT);

    expect(questions.length).toBe(pack.questions.length);
    expect(flashcards.length).toBe(pack.flashcards.length);
    expect(sheets.length).toBe(pack.cheatSheets.length);
    expect(questions.every((q) => q.verified === true)).toBe(true);
    expect(await seedRepo.getVersion(CERT)).toBe(pack.version);

    // Re-running does nothing (version already applied) — no duplicates.
    const second = await seedCertification(CERT);
    expect(second).toBe(false);
    const after = await questionRepo.getByCertification(CERT);
    expect(after.length).toBe(pack.questions.length);
  });

  it("maps correct answer indices to real option ids", async () => {
    await seedCertification(CERT);
    const questions = await questionRepo.getByCertification(CERT);
    for (const q of questions) {
      expect(q.correctOptionIds.length).toBeGreaterThan(0);
      const optionIds = new Set(q.options.map((o) => o.id));
      expect(q.correctOptionIds.every((id) => optionIds.has(id))).toBe(true);
    }
  });
});
