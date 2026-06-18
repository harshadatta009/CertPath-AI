"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Trash2, Lightbulb, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { progressRepo } from "@/database/repositories";
import { uid, cn } from "@/lib/utils";
import type { ExamQuestion } from "@/types";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const DIFFICULTY_VARIANT = {
  easy: "success",
  medium: "warning",
  hard: "destructive",
} as const;

const TYPE_LABEL = {
  mcq: "Single choice",
  "multi-select": "Multiple choice",
  scenario: "Scenario",
} as const;

function sameSet(a: string[], b: Set<string>): boolean {
  if (a.length !== b.size) return false;
  return a.every((id) => b.has(id));
}

interface QuizQuestionProps {
  question: ExamQuestion;
  index: number;
  certificationId: string;
  domainName: string;
  /** Notify the page that an answer was checked, with correctness. */
  onChecked: (questionId: string, correct: boolean) => void;
  onDelete: (questionId: string) => void;
}

export function QuizQuestion({
  question,
  index,
  certificationId,
  domainName,
  onChecked,
  onDelete,
}: QuizQuestionProps) {
  const isMulti = question.type === "multi-select";
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [checked, setChecked] = React.useState(false);

  const correctIds = React.useMemo(
    () => new Set(question.correctOptionIds),
    [question.correctOptionIds],
  );

  function toggle(optionId: string) {
    if (checked) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (isMulti) {
        if (next.has(optionId)) next.delete(optionId);
        else next.add(optionId);
      } else {
        next.clear();
        next.add(optionId);
      }
      return next;
    });
  }

  async function check() {
    if (checked || selected.size === 0) return;
    const correct = sameSet(question.correctOptionIds, selected);
    setChecked(true);
    onChecked(question.id, correct);
    await progressRepo.addAttempt({
      id: uid("att"),
      certificationId,
      questionId: question.id,
      domainId: question.domainId,
      difficulty: question.difficulty,
      correct,
      createdAt: Date.now(),
    });
  }

  const isCorrectOverall = checked && sameSet(question.correctOptionIds, selected);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.3) }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="font-mono">
              Q{index + 1}
            </Badge>
            <Badge variant={DIFFICULTY_VARIANT[question.difficulty]}>
              {question.difficulty}
            </Badge>
            <Badge variant="outline">{TYPE_LABEL[question.type]}</Badge>
            {domainName && <Badge variant="outline">{domainName}</Badge>}
            {question.verified && (
              <Badge variant="success" className="gap-1">
                <ShieldCheck className="h-3 w-3" /> Verified
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="-mr-2 -mt-2 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(question.id)}
            aria-label={`Delete question ${index + 1}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-base font-medium leading-relaxed">{question.question}</p>

          <ul className="space-y-2" role="group" aria-label="Answer options">
            {question.options.map((opt, i) => {
              const isSelected = selected.has(opt.id);
              const isCorrect = correctIds.has(opt.id);
              const showCorrect = checked && isCorrect;
              const showWrong = checked && isSelected && !isCorrect;

              return (
                <li key={opt.id}>
                  <button
                    type="button"
                    onClick={() => toggle(opt.id)}
                    disabled={checked}
                    aria-pressed={isSelected}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg border p-3 text-left text-sm transition-colors",
                      !checked && "hover:bg-accent hover:text-accent-foreground",
                      !checked && isSelected && "border-primary bg-primary/5",
                      checked && "cursor-default",
                      showCorrect && "border-success bg-success/10 text-success",
                      showWrong && "border-destructive bg-destructive/10 text-destructive",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-xs font-semibold",
                        isMulti ? "rounded-md" : "rounded-full",
                        "border",
                        isSelected && !checked && "border-primary bg-primary text-primary-foreground",
                        showCorrect && "border-success bg-success text-white",
                        showWrong && "border-destructive bg-destructive text-white",
                      )}
                    >
                      {LETTERS[i] ?? "?"}
                    </span>
                    <span className="flex-1 leading-relaxed">{opt.text}</span>
                    {showCorrect && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
                    {showWrong && <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
                  </button>
                </li>
              );
            })}
          </ul>

          {checked && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-2 rounded-lg border-l-2 border-primary bg-accent p-4"
            >
              <div
                className={cn(
                  "flex items-center gap-2 text-sm font-semibold",
                  isCorrectOverall ? "text-success" : "text-destructive",
                )}
              >
                {isCorrectOverall ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Correct
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" /> Not quite
                  </>
                )}
              </div>
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                <span className="leading-relaxed">{question.explanation}</span>
              </p>
            </motion.div>
          )}
        </CardContent>

        {!checked && (
          <CardFooter className="justify-between">
            <span className="text-xs text-muted-foreground">
              {isMulti ? "Select all that apply" : "Select one answer"}
            </span>
            <Button
              variant="gradient"
              size="sm"
              onClick={check}
              disabled={selected.size === 0}
              aria-label={`Check answer for question ${index + 1}`}
            >
              Check
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}
