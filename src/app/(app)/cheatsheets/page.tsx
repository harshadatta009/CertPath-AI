"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, ScrollText, Sparkles } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { CheatSheetCard } from "@/features/cheatsheets/cheatsheet-card";
import { useActiveCertification } from "@/hooks/use-active-certification";
import { useSettingsStore } from "@/store/settings-store";
import { generateCheatSheet } from "@/services/content-service";
import { seedCertification } from "@/services/seed-service";
import { cheatsheetRepo } from "@/database/repositories";
import { FRIENDLY_MESSAGES, type AIError } from "@/services/ai/errors";
import type { CheatSheet } from "@/types";

/** AWS-style comparison prompts that work well as cheat-sheet topics. */
const COMPARISON_IDEAS = [
  "S3 vs EBS vs EFS",
  "SNS vs SQS",
  "Lambda vs EC2",
  "RDS vs DynamoDB",
];

export default function CheatSheetsPage() {
  const cert = useActiveCertification();
  const settings = useSettingsStore((s) => s.settings);

  const [sheets, setSheets] = React.useState<CheatSheet[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [generating, setGenerating] = React.useState(false);
  const [topic, setTopic] = React.useState("");

  const loadSheets = React.useCallback(async () => {
    setLoading(true);
    try {
      await seedCertification(cert.id);
      const data = await cheatsheetRepo.getByCertification(cert.id);
      setSheets(data);
    } finally {
      setLoading(false);
    }
  }, [cert.id]);

  React.useEffect(() => {
    void loadSheets();
  }, [loadSheets]);

  const generate = React.useCallback(
    async (rawTopic: string) => {
      const trimmed = rawTopic.trim();
      if (!trimmed) {
        toast.info("Add a topic", "Type a topic or pick a suggestion to generate.");
        return;
      }
      setGenerating(true);
      try {
        const sheet = await generateCheatSheet(cert, settings, trimmed);
        await loadSheets();
        setTopic("");
        toast.success("Cheat sheet ready", `“${sheet.topic}” is ready to study.`);
      } catch (err) {
        const e = err as AIError;
        toast.error("Failed", FRIENDLY_MESSAGES[e.code] ?? e.message);
      } finally {
        setGenerating(false);
      }
    },
    [cert, settings, loadSheets],
  );

  const handleDelete = React.useCallback(
    async (id: string) => {
      try {
        await cheatsheetRepo.remove(id);
        setSheets((prev) => prev.filter((s) => s.id !== id));
        toast.success("Deleted", "The cheat sheet was removed.");
      } catch (err) {
        const e = err as AIError;
        toast.error("Failed", FRIENDLY_MESSAGES[e.code] ?? e.message);
      }
    },
    [],
  );

  // Suggestion chips: cert domain topics first, then AWS-style comparisons.
  const suggestions = React.useMemo(() => {
    const topicNames = cert.domains.flatMap((d) => d.topics).map((t) => t.name);
    const seen = new Set<string>();
    const all = [...topicNames, ...COMPARISON_IDEAS];
    return all.filter((name) => {
      const key = name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [cert.domains]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cheat Sheets"
        description="Dense, exam-ready references — definitions, architecture, best practices, comparisons, and tips in one glance."
      />

      <RequireApiKey>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Generate a cheat sheet
            </CardTitle>
            <CardDescription>
              {cert.name} ({cert.code})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !generating) {
                    e.preventDefault();
                    void generate(topic);
                  }
                }}
                placeholder="e.g. Amazon S3, VPC networking, IAM policies…"
                disabled={generating}
                className="sm:flex-1"
              />
              <Button
                variant="gradient"
                onClick={() => void generate(topic)}
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
                    Generate
                  </>
                )}
              </Button>
            </div>

            {suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Quick picks
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((name) => (
                    <button
                      key={name}
                      type="button"
                      disabled={generating}
                      onClick={() => {
                        setTopic(name);
                        void generate(name);
                      }}
                      className="rounded-full border bg-card px-3 py-1 text-xs font-medium text-foreground/80 transition-colors hover:border-primary/40 hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </RequireApiKey>

      {loading ? (
        <SheetsSkeleton />
      ) : sheets.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No cheat sheets yet"
          description="Generate one above — enter a topic or tap a quick pick. Each sheet packs definitions, architecture, comparisons, and exam tips you can export to PDF."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {sheets.map((sheet, i) => (
              <motion.div key={sheet.id} layout exit={{ opacity: 0, scale: 0.96 }}>
                <CheatSheetCard
                  cert={cert}
                  sheet={sheet}
                  index={i}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function SheetsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="space-y-3 rounded-xl border bg-card p-5">
          <div className="flex items-start gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3 rounded" />
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-4/5 rounded" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 flex-1 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
