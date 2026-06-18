"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  AlarmClock,
  CalendarClock,
  CheckSquare,
  Clock,
  Download,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { useActiveCertification } from "@/hooks/use-active-certification";
import { useSettingsStore } from "@/store/settings-store";
import { generateRevisionPlan } from "@/services/content-service";
import { revisionRepo } from "@/database/repositories";
import { FRIENDLY_MESSAGES, type AIError } from "@/services/ai/errors";
import { exportRevisionPdf } from "@/features/revision/export-revision";
import type { RevisionPlan, RevisionWindow } from "@/types";
import type { LucideIcon } from "lucide-react";

interface WindowMeta {
  value: RevisionWindow;
  label: string;
  hint: string;
  icon: LucideIcon;
}

const WINDOWS: readonly WindowMeta[] = [
  { value: "30-day", label: "30 Day", hint: "Steady runway", icon: CalendarClock },
  { value: "15-day", label: "15 Day", hint: "Tighten up", icon: CalendarClock },
  { value: "7-day", label: "7 Day", hint: "Final week", icon: CalendarClock },
  { value: "last-week", label: "Last Week", hint: "Consolidate", icon: Clock },
  { value: "48-hours", label: "Final 48 Hours", hint: "High-yield only", icon: AlarmClock },
  { value: "24-hours", label: "Final 24 Hours", hint: "Quick recall", icon: AlarmClock },
  { value: "exam-day", label: "Exam Day", hint: "Calm & ready", icon: CheckSquare },
] as const;

const DEFAULT_WINDOW: RevisionWindow = "7-day";

/** Format a minute count as "3h 20m" / "45m". */
function formatMinutes(minutes: number): string {
  const safe = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export default function RevisionPage() {
  const cert = useActiveCertification();
  const settings = useSettingsStore((s) => s.settings);

  const [plans, setPlans] = React.useState<RevisionPlan[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [generating, setGenerating] = React.useState(false);
  const [selectedWindow, setSelectedWindow] =
    React.useState<RevisionWindow>(DEFAULT_WINDOW);
  const [checked, setChecked] = React.useState<Record<string, boolean>>({});

  const loadPlans = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await revisionRepo.getByCertification(cert.id);
      setPlans(data);
    } finally {
      setLoading(false);
    }
  }, [cert.id]);

  React.useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  const handleGenerate = React.useCallback(async () => {
    setGenerating(true);
    try {
      const plan = await generateRevisionPlan(cert, settings, selectedWindow);
      await loadPlans();
      const label =
        WINDOWS.find((w) => w.value === selectedWindow)?.label ?? selectedWindow;
      toast.success("Revision plan ready", `${label} plan generated with ${plan.items.length} topics.`);
    } catch (err) {
      const e = err as AIError;
      toast.error("Failed", FRIENDLY_MESSAGES[e.code] ?? e.message);
    } finally {
      setGenerating(false);
    }
  }, [cert, settings, selectedWindow, loadPlans]);

  // Most-recent saved plan for the selected window (if any).
  const activePlan = React.useMemo<RevisionPlan | undefined>(() => {
    return plans
      .filter((p) => p.window === selectedWindow)
      .sort((a, b) => b.createdAt - a.createdAt)[0];
  }, [plans, selectedWindow]);

  // Reset checklist state whenever the displayed plan changes.
  React.useEffect(() => {
    setChecked({});
  }, [activePlan?.id]);

  const domainName = React.useCallback(
    (domainId: string): string =>
      cert.domains.find((d) => d.id === domainId)?.name ?? domainId,
    [cert.domains],
  );

  const totalMinutes = React.useMemo(
    () => (activePlan?.items ?? []).reduce((sum, i) => sum + i.estimatedMinutes, 0),
    [activePlan],
  );

  const checklist = activePlan?.examDayChecklist ?? [];
  const checkedCount = checklist.reduce(
    (n, _item, i) => (checked[String(i)] ? n + 1 : n),
    0,
  );
  const checkProgress =
    checklist.length > 0 ? Math.round((checkedCount / checklist.length) * 100) : 0;

  const toggleItem = (index: number) =>
    setChecked((prev) => ({ ...prev, [String(index)]: !prev[String(index)] }));

  const handleExport = () => {
    if (!activePlan) return;
    exportRevisionPdf(cert, activePlan);
    toast.success("Export started", "Your revision plan PDF is downloading.");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revision"
        description="Final-stretch revision plans and an exam-day checklist — focused on the highest-yield topics for your window."
      />

      {/* Window selector — polished segmented card row, scrolls on mobile. */}
      <div
        role="radiogroup"
        aria-label="Revision window"
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {WINDOWS.map((w) => {
          const selected = w.value === selectedWindow;
          const Icon = w.icon;
          return (
            <button
              key={w.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setSelectedWindow(w.value)}
              className={cn(
                "group flex min-w-[7.5rem] shrink-0 flex-col gap-1 rounded-xl border bg-card px-3.5 py-3 text-left transition-all",
                "hover:border-primary/50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "border-primary bg-accent shadow-sm"
                  : "border-border text-muted-foreground",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  selected ? "text-primary" : "text-muted-foreground",
                )}
              />
              <span
                className={cn(
                  "text-sm font-semibold leading-tight",
                  selected ? "text-foreground" : "text-foreground/90",
                )}
              >
                {w.label}
              </span>
              <span className="text-[11px] text-muted-foreground">{w.hint}</span>
            </button>
          );
        })}
      </div>

      {/* Generation */}
      <RequireApiKey>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Generate revision plan
            </CardTitle>
            <CardDescription>
              {cert.name} ({cert.code}) ·{" "}
              {WINDOWS.find((w) => w.value === selectedWindow)?.label} window
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="gradient"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Plan
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </RequireApiKey>

      {/* Body */}
      {loading ? (
        <PlanSkeleton />
      ) : !activePlan ? (
        <EmptyState
          icon={RefreshCw}
          title="No plan for this window yet"
          description="Generate a focused revision plan for the selected window. We'll prioritise the highest-yield topics and build an exam-day checklist."
        />
      ) : (
        <motion.div
          key={activePlan.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="space-y-6"
        >
          {/* Overview */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{activePlan.title}</CardTitle>
                  <CardDescription>{activePlan.summary}</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="shrink-0"
                >
                  <Download className="h-4 w-4" />
                  PDF
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {WINDOWS.find((w) => w.value === activePlan.window)?.label ??
                    activePlan.window}
                </Badge>
                <Badge variant="outline">
                  {activePlan.items.length} topic
                  {activePlan.items.length === 1 ? "" : "s"}
                </Badge>
                <Badge variant="success">
                  <Clock className="mr-1 h-3 w-3" />
                  {formatMinutes(totalMinutes)} total
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Revision items */}
          <div className="grid gap-4 sm:grid-cols-2">
            {activePlan.items.map((item, idx) => (
              <motion.div
                key={`${item.topic}-${idx}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(idx * 0.04, 0.3) }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-base leading-snug">
                        {item.topic}
                      </CardTitle>
                      <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {formatMinutes(item.estimatedMinutes)}
                      </span>
                    </div>
                    <div>
                      <Badge variant="default">{domainName(item.domainId)}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      {item.keyPoints.map((point, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Exam-day checklist */}
          {checklist.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-primary" />
                  Exam-day checklist
                </CardTitle>
                <CardDescription>
                  {checkedCount} of {checklist.length} done
                </CardDescription>
                <div className="pt-2">
                  <Progress
                    value={checkProgress}
                    indicatorClassName={checkProgress === 100 ? "bg-success" : undefined}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Separator className="mb-3" />
                <ul className="space-y-1">
                  {checklist.map((item, i) => {
                    const isChecked = Boolean(checked[String(i)]);
                    return (
                      <li key={i}>
                        <button
                          type="button"
                          aria-pressed={isChecked}
                          onClick={() => toggleItem(i)}
                          className={cn(
                            "flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left text-sm transition-colors",
                            "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          )}
                        >
                          <CheckSquare
                            className={cn(
                              "mt-0.5 h-4 w-4 shrink-0 transition-colors",
                              isChecked ? "text-success" : "text-muted-foreground",
                            )}
                          />
                          <span
                            className={cn(
                              "transition-colors",
                              isChecked
                                ? "text-muted-foreground line-through"
                                : "text-foreground",
                            )}
                          >
                            {item}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}

function PlanSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-28 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-44 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
