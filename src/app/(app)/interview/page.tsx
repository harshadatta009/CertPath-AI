"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessagesSquare,
  Sparkles,
  Loader2,
  Download,
  ChevronDown,
  Code2,
  Network,
  User,
  Brain,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { RequireApiKey } from "@/components/shared/require-api-key";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { useActiveCertification } from "@/hooks/use-active-certification";
import { useSettingsStore } from "@/store/settings-store";
import { generateInterviewQuestions } from "@/services/content-service";
import { interviewRepo } from "@/database/repositories";
import { FRIENDLY_MESSAGES, type AIError } from "@/services/ai/errors";
import { exportInterviewPdf } from "@/features/interview/export-interview";
import type {
  InterviewCategory,
  InterviewLevel,
  InterviewQuestion,
} from "@/types";

const LEVEL_OPTIONS: { value: InterviewLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const COUNT_OPTIONS = [5, 10] as const;

const LEVEL_BADGE: Record<
  InterviewLevel,
  "secondary" | "default" | "warning"
> = {
  beginner: "secondary",
  intermediate: "default",
  advanced: "warning",
};

const CATEGORY_META: Record<
  InterviewCategory,
  { label: string; icon: LucideIcon }
> = {
  technical: { label: "Technical", icon: Code2 },
  "system-design": { label: "System Design", icon: Network },
  behavioral: { label: "Behavioral", icon: User },
  scenario: { label: "Scenario", icon: Brain },
};

const CATEGORY_ORDER: InterviewCategory[] = [
  "technical",
  "system-design",
  "behavioral",
  "scenario",
];

const ALL_TAB = "all";
type FilterTab = typeof ALL_TAB | InterviewCategory;

export default function InterviewPage() {
  const cert = useActiveCertification();
  const settings = useSettingsStore((s) => s.settings);

  const [questions, setQuestions] = React.useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [generating, setGenerating] = React.useState(false);

  const [level, setLevel] = React.useState<InterviewLevel>("intermediate");
  const [count, setCount] = React.useState<number>(5);
  const [tab, setTab] = React.useState<FilterTab>(ALL_TAB);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const loadQuestions = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await interviewRepo.getByCertification(cert.id);
      setQuestions(data);
    } finally {
      setLoading(false);
    }
  }, [cert.id]);

  React.useEffect(() => {
    void loadQuestions();
  }, [loadQuestions]);

  const handleGenerate = React.useCallback(async () => {
    setGenerating(true);
    try {
      const created = await generateInterviewQuestions(cert, settings, {
        count,
        level,
      });
      await loadQuestions();
      toast.success(
        "Questions ready",
        `Generated ${created.length} new ${
          created.length === 1 ? "question" : "questions"
        }.`,
      );
    } catch (err) {
      const e = err as AIError;
      toast.error("Failed", FRIENDLY_MESSAGES[e.code] ?? e.message);
    } finally {
      setGenerating(false);
    }
  }, [cert, settings, count, level, loadQuestions]);

  const handleExport = React.useCallback(() => {
    if (questions.length === 0) {
      toast.info("Nothing to export", "Generate some questions first.");
      return;
    }
    exportInterviewPdf(cert, questions);
  }, [cert, questions]);

  const countByCategory = React.useMemo(() => {
    const counts = {
      technical: 0,
      "system-design": 0,
      behavioral: 0,
      scenario: 0,
    } as Record<InterviewCategory, number>;
    for (const q of questions) counts[q.category] += 1;
    return counts;
  }, [questions]);

  const visibleQuestions = React.useMemo(
    () => (tab === ALL_TAB ? questions : questions.filter((q) => q.category === tab)),
    [questions, tab],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interview Preparation"
        description="Practice the questions you'll actually be asked — with model answers and follow-ups tailored to your certification."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={questions.length === 0}
          >
            <Download className="h-4 w-4" />
            PDF
          </Button>
        }
      />

      {/* Generation */}
      <RequireApiKey>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Generate questions
            </CardTitle>
            <CardDescription>
              {cert.name} ({cert.code})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="space-y-1.5 sm:flex-1">
                <label
                  htmlFor="iv-level"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Difficulty
                </label>
                <Select
                  value={level}
                  onValueChange={(v) => setLevel(v as InterviewLevel)}
                >
                  <SelectTrigger id="iv-level" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVEL_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="iv-count"
                  className="text-xs font-medium text-muted-foreground"
                >
                  How many
                </label>
                <Select
                  value={String(count)}
                  onValueChange={(v) => setCount(Number(v))}
                >
                  <SelectTrigger id="iv-count" className="w-full sm:w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNT_OPTIONS.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} questions
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="gradient"
                onClick={handleGenerate}
                disabled={generating}
                className="sm:w-auto"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Questions
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </RequireApiKey>

      {/* Body */}
      {loading ? (
        <ListSkeleton />
      ) : questions.length === 0 ? (
        <EmptyState
          icon={MessagesSquare}
          title="No interview questions yet"
          description="Generate a set above to rehearse with realistic questions, model answers, and the follow-ups an interviewer is likely to ask next."
        />
      ) : (
        <Tabs value={tab} onValueChange={(v) => setTab(v as FilterTab)}>
          <TabsList className="flex-wrap">
            <TabsTrigger value={ALL_TAB}>
              All
              <CountPill count={questions.length} active={tab === ALL_TAB} />
            </TabsTrigger>
            {CATEGORY_ORDER.map((category) => {
              const meta = CATEGORY_META[category];
              const Icon = meta.icon;
              return (
                <TabsTrigger key={category} value={category}>
                  <Icon className="h-3.5 w-3.5" />
                  {meta.label}
                  <CountPill
                    count={countByCategory[category]}
                    active={tab === category}
                  />
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={tab}>
            {visibleQuestions.length === 0 ? (
              <EmptyState
                icon={MessagesSquare}
                title="Nothing in this category"
                description="No questions match this filter yet. Generate more, or switch to another category."
              />
            ) : (
              <div className="space-y-3">
                {visibleQuestions.map((q) => (
                  <QuestionItem
                    key={q.id}
                    question={q}
                    expanded={expandedId === q.id}
                    onToggle={() =>
                      setExpandedId((prev) => (prev === q.id ? null : q.id))
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function CountPill({ count, active }: { count: number; active: boolean }) {
  return (
    <span
      className={cn(
        "ml-1 rounded-full px-1.5 text-[11px] font-semibold tabular-nums",
        active
          ? "bg-primary/10 text-primary"
          : "bg-foreground/10 text-muted-foreground",
      )}
    >
      {count}
    </span>
  );
}

function QuestionItem({
  question,
  expanded,
  onToggle,
}: {
  question: InterviewQuestion;
  expanded: boolean;
  onToggle: () => void;
}) {
  const meta = CATEGORY_META[question.category];
  const Icon = meta.icon;
  const bodyId = `iv-body-${question.id}`;

  return (
    <Card className="overflow-hidden rounded-xl">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={bodyId}
        className="flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:px-5"
      >
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="h-4 w-4" />
        </span>

        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm font-medium leading-snug">{question.question}</p>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={LEVEL_BADGE[question.level]}>
              {question.level}
            </Badge>
            <Badge variant="outline">{meta.label}</Badge>
          </div>
        </div>

        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="mt-1 shrink-0 text-muted-foreground"
          aria-hidden="true"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id={bodyId}
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t px-4 py-4 sm:px-5">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Model answer
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {question.answer}
                </p>
              </div>

              {question.followUps.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Follow-up questions
                  </p>
                  <ul className="space-y-1.5">
                    {question.followUps.map((f, i) => (
                      <li
                        key={i}
                        className="flex gap-2 text-sm text-foreground/90"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full max-w-xl rounded-lg" />
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[4.75rem] w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
