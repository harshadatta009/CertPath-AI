import { describe, it, expect } from "vitest";
import { reviewFlashcard } from "@/services/content-service";
import type { Flashcard } from "@/types";

function makeCard(): Flashcard {
  return {
    id: "fc1",
    certificationId: "aws-saa-c03",
    category: "IAM",
    difficulty: "medium",
    question: "What is an IAM role?",
    answer: "A set of permissions assumable by trusted entities.",
    bookmarked: false,
    srs: {
      repetitions: 0,
      easeFactor: 2.5,
      intervalDays: 0,
      dueDate: new Date().toISOString().slice(0, 10),
      lastReviewedAt: null,
    },
    createdAt: Date.now(),
  };
}

describe("reviewFlashcard (SM-2)", () => {
  it("resets repetitions on a failing grade", () => {
    let card = makeCard();
    card = reviewFlashcard(card, 4); // pass once
    card = reviewFlashcard(card, 1); // fail
    expect(card.srs.repetitions).toBe(0);
    expect(card.srs.intervalDays).toBe(1);
  });

  it("grows the interval across successful reviews", () => {
    let card = makeCard();
    card = reviewFlashcard(card, 5);
    expect(card.srs.intervalDays).toBe(1);
    card = reviewFlashcard(card, 5);
    expect(card.srs.intervalDays).toBe(6);
    card = reviewFlashcard(card, 5);
    expect(card.srs.intervalDays).toBeGreaterThan(6);
  });

  it("keeps ease factor at or above the 1.3 floor", () => {
    let card = makeCard();
    for (let i = 0; i < 5; i++) card = reviewFlashcard(card, 3);
    expect(card.srs.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it("sets a future due date and a review timestamp", () => {
    const card = reviewFlashcard(makeCard(), 4);
    expect(card.srs.lastReviewedAt).not.toBeNull();
    expect(card.srs.dueDate >= new Date().toISOString().slice(0, 10)).toBe(true);
  });
});
