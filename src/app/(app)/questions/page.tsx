"use client";

import * as React from "react";
import { AnimatePresence } from "framer-motion";
import {
  FileQuestion,
  Sparkles,
  Loader2,
  Download,
  Target,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { RequireApiKey } from "@/components/shared/require-api-key";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { useActiveCertification } from "@/hooks/use-active-certification";
import { useSettingsStore } from "@/store/settings-store";
import { generateQuestions } from "@/services/content-service";
import { seedCertification } from "@/services/seed-service";
import { questionRepo } from "@/database/repositories";
import { FRIENDLY_MESSAGES, type AIError } from "@/services/ai/errors";
import { pct } from "@/lib/utils";
import type { ExamQuestion } from "@/types";
import { QuizQuestion } from "@/features/questions/quiz";
import { exportQuestionsPdf } from "@/features/questions/export-questions";

const ALL_DOMAINS = "__all__";
const COUNTS = ["5", "10", "15"] as const;
const DIFFICULTIES = ["mixed", "easy", "medium", "hard"] as const;
type DifficultyOption = (typeof DIFFICULTIES)[number];

export default function QuestionsPage() {
  const cert = useActiveCertification();
  const settings = useSettingsStore((s) => s.settings);

  const [questions, setQuestions] = React.useState<ExamQuestion[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [generating, setGenerating] = React.useState(false);

  const [count, setCount] = React.useState<string>("10");
  const [difficulty, setDifficulty] = React.useState<DifficultyOption>("mixed");
  const [domainId, setDomainId] = React.useState<string>(ALL_DOMAINS);

  // Track which questions have been answered, and how many were correct.
  const [results, setResults] = React.useState<Record<string, boolean>>({});

  const domainNameById = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const d of cert.domains) map.set(d.id, d.name);
    return map;
  }, [cert.domains]);

  const loadQuestions = React.useCallback(async () => {
    setLoading(true);
    try {
      await seedCertification(cert.id);
      const list = await questionRepo.getByCertification(cert.id);
      list.sort((a, b) => b.createdAt - a.createdAt);
      setQuestions(list);
    } finally {
      setLoading(false);
    }
  }, [cert.id]);

  React.useEffect(() => {
    void loadQuestions();
  }, [loadQuestions]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const { added } = await generateQuestions(cert, settings, {
        count: Number(count),
        difficulty,
        domainId: domainId === ALL_DOMAINS ? undefined : domainId,
      });
      await loadQuestions();
      if (added > 0) {
        toast.success(
          `Added ${added} question${added === 1 ? "" : "s"}`,
          "Scroll down to start practicing.",
        );
      } else {
        toast.info(
          "No new questions added",
          "All generated questions were duplicates of ones you already have.",
        );
      }
    } catch (err) {
      const e = err as AIError;
      toast.error("Failed to generate questions", FRIENDLY_MESSAGES[e.code] ?? e.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete(id: string) {
    await questionRepo.remove(id);
    setResults((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    await loadQuestions();
    toast.success("Question deleted");
  }

  function handleChecked(questionId: string, correct: boolean) {
    setResults((prev) => ({ ...prev, [questionId]: correct }));
  }

  function handleExport() {
    if (questions.length === 0) return;
    exportQuestionsPdf(cert, questions);
    toast.success("PDF exported", `${questions.length} questions saved.`);
  }

  const answeredCount = Object.keys(results).length;
  const correctCount = Object.values(results).filter(Boolean).length;
  const scorePct = pct(correctCount, answeredCount);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Practice Questions"
        description={`Generate and practice exam-style questions for ${cert.name} (${cert.code}).`}
        actions={
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={questions.length === 0}
            aria-label="Export all questions to PDF"
          >
            <Download className="h-4 w-4" /> PDF
          </Button>
        }
      />

      {/* Generation panel */}
      <RequireApiKey>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Generate questions
            </CardTitle>
            <CardDescription>
              Pick a batch size, difficulty, and optional domain focus.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[repeat(3,1fr)_auto] lg:items-end">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Count</label>
                <Select value={count} onValueChange={setCount}>
                  <SelectTrigger aria-label="Number of questions">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c} questions
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Difficulty</label>
                <Select
                  value={difficulty}
                  onValueChange={(v) => setDifficulty(v as DifficultyOption)}
                >
                  <SelectTrigger aria-label="Difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((d) => (
                      <SelectItem key={d} value={d} className="capitalize">
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Domain</label>
                <Select value={domainId} onValueChange={setDomainId}>
                  <SelectTrigger aria-label="Domain">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_DOMAINS}>All domains</SelectItem>
                    {cert.domains.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="gradient"
                onClick={handleGenerate}
                disabled={generating}
                className="w-full lg:w-auto"
                aria-label="Generate questions"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Generate Questions
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </RequireApiKey>

      {/* Running score */}
      {!loading && questions.length > 0 && answeredCount > 0 && (
        <Card>
          <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-primary" />
              <span className="font-semibold">
                {correctCount}/{answeredCount} correct
              </span>
              <span className="text-muted-foreground">
                · {answeredCount} of {questions.length} answered
              </span>
            </div>
            <Progress
              value={scorePct}
              className="sm:w-64"
              indicatorClassName={
                scorePct >= 70
                  ? "bg-success"
                  : scorePct >= 40
                    ? "bg-warning"
                    : "bg-destructive"
              }
            />
          </CardContent>
        </Card>
      )}

      {/* Question list */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : questions.length === 0 ? (
        <EmptyState
          icon={FileQuestion}
          title="No questions yet"
          description="Generate your first batch of practice questions using the panel above to start testing your knowledge."
        />
      ) : (
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {questions.map((q, i) => (
              <QuizQuestion
                key={q.id}
                question={q}
                index={i}
                certificationId={cert.id}
                domainName={domainNameById.get(q.domainId) ?? ""}
                onChecked={handleChecked}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
