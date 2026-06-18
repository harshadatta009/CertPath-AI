"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Download,
  Lightbulb,
  ScrollText,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { CertificationConfig } from "@/types/certification";
import type { CheatSheet, ComparisonTable } from "@/types";
import { exportCheatSheetPdf } from "./export-cheatsheet";

interface CheatSheetCardProps {
  cert: CertificationConfig;
  sheet: CheatSheet;
  index?: number;
  onDelete: (id: string) => void;
}

export function CheatSheetCard({
  cert,
  sheet,
  index = 0,
  onDelete,
}: CheatSheetCardProps) {
  const [open, setOpen] = React.useState(false);

  const handleExport = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      exportCheatSheetPdf(cert, sheet);
    },
    [cert, sheet],
  );

  const handleDelete = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(sheet.id);
    },
    [onDelete, sheet.id],
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.3) }}
        className="h-full"
      >
        <Card
          role="button"
          tabIndex={0}
          onClick={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setOpen(true);
            }
          }}
          className={cn(
            "group flex h-full cursor-pointer flex-col rounded-xl transition-all",
            "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <ScrollText className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="truncate text-base leading-tight">
                  {sheet.topic}
                </CardTitle>
                <CardDescription className="mt-0.5 line-clamp-2">
                  {sheet.definition}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="mt-auto flex flex-col gap-3">
            <div className="flex flex-wrap gap-1.5">
              {sheet.useCases.length > 0 && (
                <Badge variant="secondary">
                  {sheet.useCases.length} use case
                  {sheet.useCases.length === 1 ? "" : "s"}
                </Badge>
              )}
              {sheet.bestPractices.length > 0 && (
                <Badge variant="success">
                  {sheet.bestPractices.length} best practice
                  {sheet.bestPractices.length === 1 ? "" : "s"}
                </Badge>
              )}
              {sheet.commonMistakes.length > 0 && (
                <Badge variant="warning">
                  {sheet.commonMistakes.length} pitfall
                  {sheet.commonMistakes.length === 1 ? "" : "s"}
                </Badge>
              )}
              {sheet.comparisonTables.length > 0 && (
                <Badge variant="outline">
                  {sheet.comparisonTables.length} comparison
                  {sheet.comparisonTables.length === 1 ? "" : "s"}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex-1"
              >
                <Download className="h-3.5 w-3.5" />
                PDF
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                aria-label="Delete cheat sheet"
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 pr-6 text-xl">
              <ScrollText className="h-5 w-5 shrink-0 text-primary" />
              {sheet.topic}
            </DialogTitle>
            <DialogDescription>
              {cert.name} ({cert.code})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <Section title="Definition">
              <p className="text-sm leading-relaxed text-foreground/90">
                {sheet.definition}
              </p>
            </Section>

            {sheet.architecture.trim().length > 0 && (
              <>
                <Separator />
                <Section title="Architecture" icon={<Boxes className="h-4 w-4" />}>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                    {sheet.architecture}
                  </p>
                </Section>
              </>
            )}

            {sheet.useCases.length > 0 && (
              <>
                <Separator />
                <Section title="Use Cases">
                  <ul className="space-y-1.5">
                    {sheet.useCases.map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-2 text-sm leading-relaxed text-foreground/90"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Section>
              </>
            )}

            {sheet.bestPractices.length > 0 && (
              <>
                <Separator />
                <Section title="Best Practices">
                  <ul className="space-y-1.5">
                    {sheet.bestPractices.map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm leading-relaxed text-foreground/90"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Section>
              </>
            )}

            {sheet.commonMistakes.length > 0 && (
              <>
                <Separator />
                <Section title="Common Mistakes">
                  <ul className="space-y-1.5">
                    {sheet.commonMistakes.map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-2 rounded-lg bg-warning/10 px-3 py-2 text-sm leading-relaxed text-foreground/90"
                      >
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Section>
              </>
            )}

            {sheet.comparisonTables.length > 0 && (
              <>
                <Separator />
                <Section title="Comparisons">
                  <div className="space-y-5">
                    {sheet.comparisonTables.map((table, i) => (
                      <ComparisonTableView key={i} table={table} />
                    ))}
                  </div>
                </Section>
              </>
            )}

            {sheet.examTips.length > 0 && (
              <>
                <Separator />
                <Section title="Exam Tips">
                  <ul className="space-y-1.5">
                    {sheet.examTips.map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-2 text-sm leading-relaxed text-foreground/90"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Section>
              </>
            )}

            {sheet.interviewTips.length > 0 && (
              <>
                <Separator />
                <Section
                  title="Interview Tips"
                  icon={<Lightbulb className="h-4 w-4 text-warning" />}
                >
                  <ul className="space-y-1.5">
                    {sheet.interviewTips.map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-2 text-sm leading-relaxed text-foreground/90"
                      >
                        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Section>
              </>
            )}

            {sheet.sections.length > 0 &&
              sheet.sections.map((section, i) => (
                <React.Fragment key={i}>
                  <Separator />
                  <Section title={section.heading}>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                      {section.body}
                    </p>
                  </Section>
                </React.Fragment>
              ))}

            <Separator />
            <div className="flex justify-end">
              <Button
                variant="gradient"
                onClick={() => exportCheatSheetPdf(cert, sheet)}
              >
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h3 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

function ComparisonTableView({ table }: { table: ComparisonTable }) {
  return (
    <div className="space-y-2">
      {table.title && (
        <p className="text-sm font-medium text-foreground">{table.title}</p>
      )}
      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-accent text-left">
                {table.headers.map((header, i) => (
                  <th
                    key={i}
                    className="whitespace-nowrap px-3 py-2 text-xs font-semibold uppercase tracking-wide text-accent-foreground"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, ri) => (
                <tr
                  key={ri}
                  className={cn(
                    "border-t",
                    ri % 2 === 1 && "bg-muted/40",
                  )}
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="px-3 py-2 align-top text-foreground/90"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
