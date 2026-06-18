"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/toast";
import { reviewFlashcard } from "@/services/content-service";
import { flashcardRepo } from "@/database/repositories";
import { cn } from "@/lib/utils";
import type { Difficulty, Flashcard } from "@/types";

interface FlashcardDeckProps {
  cards: Flashcard[];
  /** Patch a card in the parent's local state after persistence. */
  onCardUpdated: (id: string, patch: Partial<Flashcard>) => void;
}

const DIFFICULTY_VARIANT: Record<
  Difficulty,
  "success" | "warning" | "destructive"
> = {
  easy: "success",
  medium: "warning",
  hard: "destructive",
};

interface ReviewGrade {
  label: string;
  grade: number;
  variant: "destructive" | "outline" | "secondary" | "gradient";
  hint: string;
}

const GRADES: ReviewGrade[] = [
  { label: "Again", grade: 1, variant: "destructive", hint: "1" },
  { label: "Hard", grade: 3, variant: "outline", hint: "2" },
  { label: "Good", grade: 4, variant: "secondary", hint: "3" },
  { label: "Easy", grade: 5, variant: "gradient", hint: "4" },
];

function intervalLabel(days: number): string {
  if (days <= 0) return "later today";
  if (days === 1) return "in 1 day";
  if (days < 30) return `in ${days} days`;
  const months = Math.round(days / 30);
  return months <= 1 ? "in ~1 month" : `in ~${months} months`;
}

export function FlashcardDeck({ cards, onCardUpdated }: FlashcardDeckProps) {
  const [index, setIndex] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  // direction: 1 forward, -1 backward — drives the slide animation.
  const [direction, setDirection] = React.useState(1);

  // Keep the index in range if the deck shrinks/changes underneath us.
  React.useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(0, cards.length - 1)));
  }, [cards.length]);

  const card = cards[index];

  const goTo = React.useCallback(
    (next: number, dir: number) => {
      if (cards.length === 0) return;
      const clamped = Math.max(0, Math.min(next, cards.length - 1));
      if (clamped === index) return;
      setDirection(dir);
      setFlipped(false);
      setIndex(clamped);
    },
    [cards.length, index],
  );

  const next = React.useCallback(
    () => goTo(index + 1, 1),
    [goTo, index],
  );
  const prev = React.useCallback(
    () => goTo(index - 1, -1),
    [goTo, index],
  );

  const handleReview = React.useCallback(
    async (grade: number) => {
      if (!card) return;
      const updated = reviewFlashcard(card, grade);
      await flashcardRepo.update(updated.id, updated);
      onCardUpdated(updated.id, updated);
      toast.info(
        "Review saved",
        `Next review ${intervalLabel(updated.srs.intervalDays)}.`,
      );
      // Advance to the next card; if at the end, stay put but flip back.
      if (index < cards.length - 1) {
        goTo(index + 1, 1);
      } else {
        setFlipped(false);
      }
    },
    [card, cards.length, goTo, index, onCardUpdated],
  );

  const toggleBookmark = React.useCallback(async () => {
    if (!card) return;
    const nextValue = !card.bookmarked;
    await flashcardRepo.update(card.id, { bookmarked: nextValue });
    onCardUpdated(card.id, { bookmarked: nextValue });
    toast.success(nextValue ? "Bookmarked" : "Bookmark removed");
  }, [card, onCardUpdated]);

  // Keyboard: ←/→ navigate, space flips, 1-4 grade when flipped.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped && /^[1-4]$/.test(e.key)) {
        e.preventDefault();
        void handleReview(GRADES[Number(e.key) - 1].grade);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, flipped, handleReview]);

  if (!card) return null;

  const position = index + 1;
  const total = cards.length;
  const progress = total > 0 ? (position / total) * 100 : 0;

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 64 : -64, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -64 : 64, opacity: 0 }),
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      {/* Position + progress */}
      <div className="flex items-center gap-4">
        <span className="shrink-0 text-sm font-medium tabular-nums text-muted-foreground">
          {position} / {total}
        </span>
        <Progress
          value={progress}
          className="h-2"
          indicatorClassName="bg-gradient-to-r from-primary to-indigo-500"
        />
      </div>

      {/* Card stage */}
      <div className="relative" style={{ perspective: "1600px" }}>
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={card.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              aria-pressed={flipped}
              aria-label={
                flipped ? "Show question" : "Show answer"
              }
              className="group relative block h-[22rem] w-full rounded-3xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:h-[24rem]"
              style={{ transformStyle: "preserve-3d" }}
            >
              <motion.div
                className="absolute inset-0 h-full w-full"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
              >
                {/* FRONT — question */}
                <div
                  className="absolute inset-0 flex flex-col overflow-hidden rounded-3xl border bg-card p-7 shadow-xl shadow-primary/5 sm:p-9"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary to-indigo-500"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{card.category}</Badge>
                      <Badge variant={DIFFICULTY_VARIANT[card.difficulty]}>
                        {card.difficulty}
                      </Badge>
                    </div>
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Question
                    </span>
                  </div>
                  <div className="flex flex-1 items-center justify-center py-4">
                    <p className="text-balance text-center text-xl font-semibold leading-snug sm:text-2xl">
                      {card.question}
                    </p>
                  </div>
                  <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <RotateCcw className="h-3.5 w-3.5" />
                    Tap or press space to flip
                  </p>
                </div>

                {/* BACK — answer */}
                <div
                  className="absolute inset-0 flex flex-col overflow-hidden rounded-3xl border bg-card p-7 shadow-xl shadow-primary/5 sm:p-9"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-success to-emerald-400"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="success">Answer</Badge>
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {card.category}
                    </span>
                  </div>
                  <div className="flex flex-1 items-center justify-center overflow-y-auto py-4">
                    <p className="text-balance whitespace-pre-line text-center text-lg leading-relaxed sm:text-xl">
                      {card.answer}
                    </p>
                  </div>
                  <p className="text-center text-xs text-muted-foreground">
                    How well did you remember?
                  </p>
                </div>
              </motion.div>
            </button>
          </motion.div>
        </AnimatePresence>

        {/* Bookmark — sits above the flipping faces */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleBookmark}
          aria-pressed={card.bookmarked}
          aria-label={card.bookmarked ? "Remove bookmark" : "Bookmark card"}
          className="absolute right-3 top-12 z-10 rounded-full bg-background/70 backdrop-blur hover:bg-background"
        >
          {card.bookmarked ? (
            <BookmarkCheck className="h-5 w-5 text-primary" />
          ) : (
            <Bookmark className="h-5 w-5 text-muted-foreground" />
          )}
        </Button>
      </div>

      {/* Spaced-repetition controls (only when flipped) */}
      <AnimatePresence initial={false}>
        {flipped && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="grid grid-cols-2 gap-2 sm:grid-cols-4"
          >
            {GRADES.map((g) => (
              <Button
                key={g.label}
                variant={g.variant}
                onClick={() => void handleReview(g.grade)}
                className="flex-col gap-0.5 py-2 h-auto"
              >
                <span className="font-semibold">{g.label}</span>
                <span
                  className={cn(
                    "text-[10px] font-normal opacity-70",
                    g.variant === "gradient" && "text-white/80",
                  )}
                >
                  press {g.hint}
                </span>
              </Button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prev}
          disabled={index === 0}
          aria-label="Previous card"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFlipped((f) => !f)}
          className="text-muted-foreground"
        >
          <RotateCcw className="h-4 w-4" />
          Flip
        </Button>
        <Button
          variant="outline"
          onClick={next}
          disabled={index === total - 1}
          aria-label="Next card"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
