import { describe, it, expect, beforeEach } from "vitest";
import { questionRepo } from "@/database/repositories";
import { getDB } from "@/database/db";
import type { ExamQuestion } from "@/types";

function q(hash: string): ExamQuestion {
  return {
    id: `id_${hash}`,
    certificationId: "aws-saa-c03",
    type: "mcq",
    difficulty: "easy",
    domainId: "design-secure",
    topic: "IAM",
    question: `Question ${hash}`,
    options: [
      { id: "a", text: "A" },
      { id: "b", text: "B" },
    ],
    correctOptionIds: ["a"],
    explanation: "Because.",
    hash,
    createdAt: Date.now(),
  };
}

describe("questionRepo (IndexedDB via fake-indexeddb)", () => {
  beforeEach(async () => {
    await getDB().questions.clear();
  });

  it("adds questions and skips duplicate hashes", async () => {
    const added1 = await questionRepo.addMany([q("h1"), q("h2")]);
    expect(added1).toBe(2);

    // h2 is a duplicate hash; only h3 should be added.
    const added2 = await questionRepo.addMany([q("h2"), q("h3")]);
    expect(added2).toBe(1);

    const all = await questionRepo.getByCertification("aws-saa-c03");
    expect(all).toHaveLength(3);

    const hashes = await questionRepo.existingHashes("aws-saa-c03");
    expect(hashes.has("h1")).toBe(true);
    expect(hashes.size).toBe(3);
  });
});
