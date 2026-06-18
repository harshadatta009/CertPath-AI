"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart3,
  Target,
  TrendingUp,
  Flame,
  Activity,
  Award,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ScoreRing,
  DomainBars,
  WeeklyHoursChart,
  ConsistencyDots,
  StudyHeatmap,
} from "@/features/analytics/charts";
import { useAnalytics } from "@/hooks/use-analytics";
import { useRoadmapStore } from "@/store/roadmap-store";
import { getCertification } from "@/constants/certifications";
import type { DomainScore } from "@/types";

/** Pick a semantic ring color for a 0-100 score. */
function ringColor(value: number): string {
  if (value >= 70) return "hsl(var(--success))";
  if (value >= 50) return "hsl(var(--warning))";
  return "hsl(var(--destructive))";
}

export default function AnalyticsPage() {
  const loaded = useRoadmapStore((s) => s.loaded);
  const { snapshot, sessions, attempts, active, loading } = useAnalytics();

  // 1. Loading
  if (!loaded || loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-80 lg:col-span-1" />
          <Skeleton className="h-80 lg:col-span-2" />
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  // 2. Empty
  if (!active || !snapshot) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics" />
        <EmptyState
          icon={BarChart3}
          title="No analytics yet"
          description="Generate a personalized roadmap to unlock readiness scoring, domain mastery, study consistency and pass predictions."
          action={
            <Button asChild variant="gradient" size="lg">
              <Link href="/generate">
                <Sparkles className="h-5 w-5" /> Generate My Roadmap
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  // 3. Dashboard
  const cert = getCertification(active.certificationId);

  const passPct = Math.round(snapshot.passProbability * 100);
  const readiness = Math.round(snapshot.readinessScore);

  // Merge snapshot domain scores into the full cert domain list.
  const knownScores = [...snapshot.weakDomains, ...snapshot.strongDomains];
  const domainScores: DomainScore[] = cert
    ? cert.domains.map((d) => {
        const found = knownScores.find((s) => s.domainId === d.id);
        return (
          found ?? { domainId: d.id, domainName: d.name, score: 0, attempts: 0 }
        );
      })
    : knownScores;

  const totalAttempts = attempts.length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description={
          cert
            ? `Exam readiness, mastery and consistency for ${cert.name} (${cert.code}).`
            : "Exam readiness, mastery and consistency for your active roadmap."
        }
      />

      {/* Top stat row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Target}
          label="Readiness Score"
          value={`${readiness}%`}
          hint="Completion + mastery"
          accent="text-primary"
          delay={0}
        />
        <StatCard
          icon={Award}
          label="Predicted Pass"
          value={`${passPct}%`}
          hint="Estimated likelihood"
          accent="text-success"
          delay={0.05}
        />
        <StatCard
          icon={Flame}
          label="Study Streak"
          value={`${snapshot.studyStreak}d`}
          hint="Consecutive days"
          accent="text-orange-500"
          delay={0.1}
        />
        <StatCard
          icon={Activity}
          label="Consistency"
          value={`${Math.round(snapshot.consistency)}%`}
          hint={`${Math.round(snapshot.totalStudyHours)}h logged`}
          accent="text-primary"
          delay={0.15}
        />
      </div>

      {/* Readiness + study hours */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-xl lg:col-span-1">
          <CardHeader>
            <CardTitle>Exam readiness</CardTitle>
            <CardDescription>
              How prepared you are right now
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <ScoreRing
              value={readiness}
              label="Ready"
              color={ringColor(readiness)}
            />
            <div className="w-full space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Predicted pass</span>
                  <span className="font-semibold">{passPct}%</span>
                </div>
                <Progress
                  value={passPct}
                  indicatorClassName={
                    passPct >= 70
                      ? "bg-success"
                      : passPct >= 50
                        ? "bg-warning"
                        : "bg-destructive"
                  }
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Roadmap completion
                  </span>
                  <span className="font-semibold">
                    {Math.round(snapshot.completion)}%
                  </span>
                </div>
                <Progress value={Math.round(snapshot.completion)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl lg:col-span-2">
          <CardHeader>
            <CardTitle>Study hours — last 14 days</CardTitle>
            <CardDescription>Daily hours logged from your sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyHoursChart sessions={sessions} />
          </CardContent>
        </Card>
      </div>

      {/* Mastery by domain */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" /> Mastery by
            domain
          </CardTitle>
          <CardDescription>
            Per-domain mastery derived from your quiz attempts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {totalAttempts === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Answer practice questions to reveal your mastery across each exam
              domain.
            </p>
          ) : (
            <DomainBars scores={domainScores} />
          )}
        </CardContent>
      </Card>

      {/* Study heatmap — last year */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" /> Study activity
          </CardTitle>
          <CardDescription>
            Your daily study over the last year — darker means more hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StudyHeatmap sessions={sessions} />
        </CardContent>
      </Card>

      {/* Consistency */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" /> Study
            consistency — last 4 weeks
          </CardTitle>
          <CardDescription>
            Each square is a day; filled squares are days you studied
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConsistencyDots sessions={sessions} />
        </CardContent>
      </Card>

      {/* Weak / recommended / strong */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-warning" /> Weak areas
            </CardTitle>
            <CardDescription>Domains to prioritize next</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {snapshot.weakDomains.length ? (
              <div className="flex flex-wrap gap-2">
                {snapshot.weakDomains.map((d) => (
                  <Badge key={d.domainId} variant="warning">
                    {d.domainName} · {Math.round(d.score)}%
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No weak areas detected — nice and balanced so far.
              </p>
            )}

            {snapshot.recommendedTopics.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Recommended focus
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {snapshot.recommendedTopics.map((t) => (
                      <Badge
                        key={t}
                        variant="secondary"
                        className="text-[11px]"
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-4 w-4 text-success" /> Strong areas
            </CardTitle>
            <CardDescription>Domains you&apos;ve got covered</CardDescription>
          </CardHeader>
          <CardContent>
            {snapshot.strongDomains.length ? (
              <div className="flex flex-wrap gap-2">
                {snapshot.strongDomains.map((d) => (
                  <Badge key={d.domainId} variant="success">
                    {d.domainName} · {Math.round(d.score)}%
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Keep practicing — strong domains will appear here as your scores
                climb.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Explainer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-2 text-xs text-muted-foreground"
      >
        <TrendingUp className="h-3.5 w-3.5 shrink-0" />
        Predicted readiness blends your roadmap completion (60%) with weighted
        quiz mastery (40%).
      </motion.p>
    </div>
  );
}
