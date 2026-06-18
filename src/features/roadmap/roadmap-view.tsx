"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import {
  ChevronDown,
  CheckCircle2,
  Circle,
  FlaskConical,
  Lightbulb,
  RefreshCw,
  Target,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn, pct } from "@/lib/utils";
import { useRoadmapStore } from "@/store/roadmap-store";
import { getCertification } from "@/constants/certifications";
import type { Roadmap, RoadmapDay } from "@/types";

export function RoadmapView({ roadmap }: { roadmap: Roadmap }) {
  const completions = useRoadmapStore((s) => s.completions);
  const completedIds = React.useMemo(
    () => new Set(completions.filter((c) => c.completed).map((c) => c.dayId)),
    [completions],
  );
  const cert = getCertification(roadmap.certificationId);
  const completedCount = roadmap.days.filter((d) => completedIds.has(d.id)).length;
  const completion = pct(completedCount, roadmap.totalDays);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div
          className="h-1.5 w-full"
          style={{ backgroundColor: cert?.color ?? "hsl(var(--primary))" }}
        />
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">{roadmap.title}</h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                {roadmap.summary}
              </p>
            </div>
            <Badge variant="secondary">{cert?.code}</Badge>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <Stat label="Days" value={roadmap.totalDays} />
            <Stat label="Weeks" value={roadmap.totalWeeks} />
            <Stat label="Total hours" value={`${roadmap.totalHours}h`} />
            <Stat label="Completed" value={`${completedCount}/${roadmap.totalDays}`} />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{completion}%</span>
            </div>
            <Progress value={completion} indicatorClassName="bg-gradient-to-r from-primary to-indigo-500" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {roadmap.days
          .slice()
          .sort((a, b) => a.dayNumber - b.dayNumber)
          .map((day) => (
            <DayCard
              key={day.id}
              day={day}
              certColor={cert?.color}
              completed={completedIds.has(day.id)}
            />
          ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <span>
      <span className="font-semibold text-foreground">{value}</span> {label}
    </span>
  );
}

function DayCard({
  day,
  completed,
  certColor,
}: {
  day: RoadmapDay;
  completed: boolean;
  certColor?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const toggleDay = useRoadmapStore((s) => s.toggleDay);

  return (
    <Card className={cn("overflow-hidden transition-colors", completed && "border-success/40 bg-success/5")}>
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={() => toggleDay(day.id)}
          className="shrink-0 transition-transform hover:scale-110"
          aria-label={completed ? "Mark day incomplete" : "Mark day complete"}
        >
          {completed ? (
            <CheckCircle2 className="h-6 w-6 text-success" />
          ) : (
            <Circle className="h-6 w-6 text-muted-foreground" />
          )}
        </button>

        <button
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-center justify-between gap-3 text-left"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-white"
                style={{ backgroundColor: certColor ?? "hsl(var(--primary))" }}
              >
                Day {day.dayNumber}
              </span>
              <span className="truncate font-medium">{day.title}</span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {format(parseISO(day.date), "EEE, MMM d")} · {day.estimatedHours}h ·{" "}
              {day.topics.length} topics
            </p>
          </div>
          <ChevronDown
            className={cn("h-5 w-5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
          />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid gap-4 border-t p-4 sm:grid-cols-2">
              <Section icon={Target} title="Topics">
                <TagList items={day.topics} />
              </Section>
              <Section icon={CheckCircle2} title="Objectives">
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {day.objectives.map((o, i) => (
                    <li key={i}>• {o}</li>
                  ))}
                </ul>
              </Section>
              {day.labs.length > 0 && (
                <Section icon={FlaskConical} title="Hands-on labs">
                  <ul className="space-y-1.5 text-sm">
                    {day.labs.map((lab, i) => (
                      <li key={i}>
                        <span className="font-medium">{lab.title}</span>
                        <span className="text-muted-foreground"> — {lab.description} ({lab.estimatedMinutes}m)</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
              {day.revisionTopics.length > 0 && (
                <Section icon={RefreshCw} title="Revision">
                  <TagList items={day.revisionTopics} variant="secondary" />
                </Section>
              )}
              {day.examTips.length > 0 && (
                <Section icon={Lightbulb} title="Exam tips">
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {day.examTips.map((t, i) => (
                      <li key={i}>• {t}</li>
                    ))}
                  </ul>
                </Section>
              )}
              <Section icon={Clock} title="Practice">
                <p className="text-sm text-muted-foreground">
                  {day.practiceQuestions} practice questions recommended.
                </p>
              </Section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Target;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {title}
      </div>
      {children}
    </div>
  );
}

function TagList({
  items,
  variant = "default",
}: {
  items: string[];
  variant?: "default" | "secondary";
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t, i) => (
        <Badge key={i} variant={variant} className="text-[11px]">
          {t}
        </Badge>
      ))}
    </div>
  );
}
