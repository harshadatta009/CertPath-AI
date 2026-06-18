"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  Cell,
  CartesianGrid,
} from "recharts";
import {
  eachDayOfInterval,
  format,
  subDays,
  startOfWeek,
  addDays,
  addWeeks,
} from "date-fns";
import { cn } from "@/lib/utils";
import type { DomainScore, StudySession } from "@/types";

const AXIS = "hsl(var(--muted-foreground))";

/** Circular readiness/score gauge. */
export function ScoreRing({
  value,
  label,
  size = 160,
  color = "hsl(var(--primary))",
}: {
  value: number;
  label: string;
  size?: number;
  color?: string;
}) {
  const data = [{ name: label, value }];
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="72%"
          outerRadius="100%"
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar background dataKey="value" cornerRadius={20} fill={color} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{Math.round(value)}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

/** Per-domain mastery bars. */
export function DomainBars({ scores }: { scores: DomainScore[] }) {
  const data = scores.map((s) => ({
    name: s.domainName.replace(/^Design /, ""),
    score: s.score,
  }));
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 48)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid horizontal={false} stroke="hsl(var(--border))" />
        <XAxis type="number" domain={[0, 100]} stroke={AXIS} fontSize={11} />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          stroke={AXIS}
          fontSize={11}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--accent))" }}
          contentStyle={{
            background: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Bar dataKey="score" radius={[0, 6, 6, 0]}>
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={d.score >= 70 ? "hsl(var(--success))" : d.score >= 50 ? "hsl(var(--warning))" : "hsl(var(--destructive))"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Daily study hours over the trailing 14 days. */
export function WeeklyHoursChart({ sessions }: { sessions: StudySession[] }) {
  const byDate = new Map<string, number>();
  for (const s of sessions) {
    byDate.set(s.date, (byDate.get(s.date) ?? 0) + s.hours);
  }
  const days = eachDayOfInterval({ start: subDays(new Date(), 13), end: new Date() });
  const data = days.map((d) => {
    const key = format(d, "yyyy-MM-dd");
    return { day: format(d, "EEE"), hours: Math.round((byDate.get(key) ?? 0) * 10) / 10 };
  });
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ left: -16, right: 8 }}>
        <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
        <XAxis dataKey="day" stroke={AXIS} fontSize={11} tickLine={false} />
        <YAxis stroke={AXIS} fontSize={11} tickLine={false} allowDecimals />
        <Tooltip
          cursor={{ fill: "hsl(var(--accent))" }}
          contentStyle={{
            background: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Bar dataKey="hours" radius={[6, 6, 0, 0]} fill="hsl(var(--primary))" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ConsistencyDots({ sessions }: { sessions: StudySession[] }) {
  const studied = new Set(sessions.filter((s) => s.hours > 0).map((s) => s.date));
  const days = eachDayOfInterval({ start: subDays(new Date(), 27), end: new Date() });
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {days.map((d) => {
        const key = format(d, "yyyy-MM-dd");
        const active = studied.has(key);
        return (
          <div
            key={key}
            title={`${format(d, "MMM d")}${active ? " — studied" : ""}`}
            className={cn(
              "aspect-square rounded-[4px]",
              active ? "bg-success" : "bg-muted",
            )}
          />
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Study heatmap — a GitHub-style contribution calendar of the last ~year of
// study activity. Intensity is driven by total hours studied each day.
// ---------------------------------------------------------------------------

const HEATMAP_LEVELS = [
  "bg-muted",
  "bg-success/30",
  "bg-success/55",
  "bg-success/80",
  "bg-success",
] as const;

/** Map daily hours to a 0-4 intensity level. */
function hoursToLevel(hours: number): number {
  if (hours <= 0) return 0;
  if (hours < 1) return 1;
  if (hours < 2) return 2;
  if (hours < 3.5) return 3;
  return 4;
}

const WEEKS = 53;

export function StudyHeatmap({
  sessions,
  className,
}: {
  sessions: StudySession[];
  className?: string;
}) {
  const byDate = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const s of sessions) {
      map.set(s.date, (map.get(s.date) ?? 0) + s.hours);
    }
    return map;
  }, [sessions]);

  const today = new Date();
  const start = startOfWeek(subDays(today, (WEEKS - 1) * 7), { weekStartsOn: 0 });

  // Build a column per week; each column is 7 day-cells (Sun..Sat).
  const columns: Array<{
    monthLabel: string | null;
    cells: Array<{ key: string; level: number; title: string; future: boolean } | null>;
  }> = [];

  let lastLabeledMonth = -1;
  let activeDays = 0;
  let totalHours = 0;

  for (let w = 0; w < WEEKS; w++) {
    const weekStart = addWeeks(start, w);
    const cells: (typeof columns)[number]["cells"] = [];
    for (let d = 0; d < 7; d++) {
      const day = addDays(weekStart, d);
      if (day > today) {
        cells.push({ key: format(day, "yyyy-MM-dd"), level: 0, title: "", future: true });
        continue;
      }
      const iso = format(day, "yyyy-MM-dd");
      const hours = byDate.get(iso) ?? 0;
      if (hours > 0) {
        activeDays++;
        totalHours += hours;
      }
      cells.push({
        key: iso,
        level: hoursToLevel(hours),
        title:
          hours > 0
            ? `${Math.round(hours * 10) / 10}h on ${format(day, "EEE, MMM d yyyy")}`
            : `No study on ${format(day, "EEE, MMM d yyyy")}`,
        future: false,
      });
    }
    // Month label sits above the column where a new month first appears.
    const firstDay = weekStart;
    const month = firstDay.getMonth();
    const monthLabel =
      month !== lastLabeledMonth && firstDay.getDate() <= 7 ? format(firstDay, "MMM") : null;
    if (monthLabel) lastLabeledMonth = month;
    columns.push({ monthLabel, cells });
  }

  const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium">
          {activeDays} study {activeDays === 1 ? "day" : "days"} in the last year
        </p>
        <p className="text-xs text-muted-foreground">
          {Math.round(totalHours)}h total
        </p>
      </div>

      <div className="overflow-x-auto scrollbar-thin pb-1">
        <div className="flex gap-[3px]" style={{ minWidth: "max-content" }}>
          {/* Day-of-week labels */}
          <div className="mr-1 flex flex-col gap-[3px] pt-[18px]">
            {dayLabels.map((l, i) => (
              <span
                key={i}
                className="h-[11px] text-[9px] leading-[11px] text-muted-foreground"
              >
                {l}
              </span>
            ))}
          </div>

          {/* Week columns */}
          {columns.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-[3px]">
              <span className="h-[15px] text-[9px] leading-[15px] text-muted-foreground">
                {col.monthLabel ?? ""}
              </span>
              {col.cells.map((cell) =>
                cell && !cell.future ? (
                  <div
                    key={cell.key}
                    title={cell.title}
                    className={cn("h-[11px] w-[11px] rounded-[2px]", HEATMAP_LEVELS[cell.level])}
                  />
                ) : (
                  <div key={cell?.key} className="h-[11px] w-[11px] rounded-[2px]" />
                ),
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
        <span>Less</span>
        {HEATMAP_LEVELS.map((c, i) => (
          <div key={i} className={cn("h-[11px] w-[11px] rounded-[2px]", c)} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
