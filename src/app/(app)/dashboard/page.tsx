"use client";

import * as React from "react";
import Link from "next/link";
import { differenceInCalendarDays, parseISO, format } from "date-fns";
import {
  CalendarDays,
  Flame,
  Target,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  LayoutDashboard,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ScoreRing, WeeklyHoursChart, DomainBars } from "@/features/analytics/charts";
import { useAnalytics } from "@/hooks/use-analytics";
import { useRoadmapStore } from "@/store/roadmap-store";
import { getCertification } from "@/constants/certifications";

export default function DashboardPage() {
  const loaded = useRoadmapStore((s) => s.loaded);
  const { snapshot, sessions, active, loading } = useAnalytics();

  if (!loaded || loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (!active || !snapshot) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" />
        <EmptyState
          icon={LayoutDashboard}
          title="Your dashboard is waiting"
          description="Generate a roadmap to unlock progress tracking, readiness scoring and study analytics."
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

  const cert = getCertification(active.certificationId);
  const daysRemaining = Math.max(
    0,
    differenceInCalendarDays(parseISO(active.profile.targetExamDate), new Date()),
  );
  const upcoming = active.days
    .filter((d) => !d.completed)
    .slice(0, 4);

  const readinessColor =
    snapshot.readinessScore >= 70
      ? "hsl(var(--success))"
      : snapshot.readinessScore >= 50
        ? "hsl(var(--warning))"
        : "hsl(var(--destructive))";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`${cert?.name} · exam on ${format(parseISO(active.profile.targetExamDate), "MMM d, yyyy")}`}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/roadmap">
              View roadmap <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={CalendarDays} label="Days remaining" value={daysRemaining} hint={`${cert?.code}`} delay={0} />
        <StatCard icon={Flame} label="Study streak" value={`${snapshot.studyStreak}d`} hint="Keep it going!" accent="text-orange-500" delay={0.05} />
        <StatCard icon={CheckCircle2} label="Completion" value={`${snapshot.completion}%`} hint={`${active.totalDays} days total`} accent="text-success" delay={0.1} />
        <StatCard icon={TrendingUp} label="Total hours" value={`${snapshot.totalStudyHours}h`} hint="Logged so far" delay={0.15} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Exam readiness</CardTitle>
            <CardDescription>Completion + quiz mastery</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <ScoreRing value={snapshot.readinessScore} label="Ready" color={readinessColor} />
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Predicted pass</span>
                <span className="font-semibold">{Math.round(snapshot.passProbability * 100)}%</span>
              </div>
              <Progress value={snapshot.passProbability * 100} indicatorClassName="bg-success" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Consistency</span>
                <span className="font-semibold">{snapshot.consistency}%</span>
              </div>
              <Progress value={snapshot.consistency} />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Study hours — last 14 days</CardTitle>
            <CardDescription>Hours logged from completed days</CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyHoursChart sessions={sessions} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Topic mastery by domain</CardTitle>
            <CardDescription>Based on your quiz attempts</CardDescription>
          </CardHeader>
          <CardContent>
            {snapshot.weakDomains.length === 0 && snapshot.strongDomains.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Answer practice questions to see per-domain mastery here.
              </p>
            ) : (
              <DomainBars
                scores={cert ? cert.domains.map((d) => {
                  const found = [...snapshot.weakDomains, ...snapshot.strongDomains].find(
                    (s) => s.domainId === d.id,
                  );
                  return found ?? { domainId: d.id, domainName: d.name, score: 0, attempts: 0 };
                }) : []}
              />
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-warning" /> Weak areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {snapshot.weakDomains.length ? (
                <div className="flex flex-wrap gap-2">
                  {snapshot.weakDomains.map((d) => (
                    <Badge key={d.domainId} variant="warning">
                      {d.domainName} · {d.score}%
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No weak areas detected yet.</p>
              )}
              {snapshot.recommendedTopics.length > 0 && (
                <div className="mt-3">
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">Recommended focus</p>
                  <div className="flex flex-wrap gap-1.5">
                    {snapshot.recommendedTopics.map((t) => (
                      <Badge key={t} variant="secondary" className="text-[11px]">{t}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upcoming topics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcoming.length ? (
                upcoming.map((d) => (
                  <div key={d.id} className="flex items-center justify-between gap-2 text-sm">
                    <div className="min-w-0">
                      <span className="font-medium">Day {d.dayNumber}</span>
                      <span className="ml-2 text-muted-foreground">{d.title}</span>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-[11px]">{d.estimatedHours}h</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">You&apos;ve completed every day. 🎉</p>
              )}
              <Button asChild variant="ghost" size="sm" className="w-full">
                <Link href="/roadmap">Open full roadmap</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
