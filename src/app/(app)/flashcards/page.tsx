"use client";

import * as React from "react";
import { Layers, Loader2, Sparkles } from "lucide-react";
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
import { FlashcardDeck } from "@/features/flashcards/flashcard-deck";
import { useActiveCertification } from "@/hooks/use-active-certification";
import { useSettingsStore } from "@/store/settings-store";
import { generateFlashcards } from "@/services/content-service";
import { seedCertification } from "@/services/seed-service";
import { flashcardRepo } from "@/database/repositories";
import { FRIENDLY_MESSAGES, type AIError } from "@/services/ai/errors";
import type { Flashcard } from "@/types";

const ALL_DOMAINS = "all";
const COUNT_OPTIONS = [10, 20, 30] as const;

type FilterTab = "due" | "all" | "bookmarked";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function FlashcardsPage() {
  const cert = useActiveCertification();
  const settings = useSettingsStore((s) => s.settings);

  const [cards, setCards] = React.useState<Flashcard[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [generating, setGenerating] = React.useState(false);

  const [count, setCount] = React.useState<number>(20);
  const [domainId, setDomainId] = React.useState<string>(ALL_DOMAINS);
  const [tab, setTab] = React.useState<FilterTab>("due");

  const loadCards = React.useCallback(async () => {
    setLoading(true);
    try {
      await seedCertification(cert.id);
      const data = await flashcardRepo.getByCertification(cert.id);
      setCards(data);
    } finally {
      setLoading(false);
    }
  }, [cert.id]);

  React.useEffect(() => {
    void loadCards();
  }, [loadCards]);

  const handleGenerate = React.useCallback(async () => {
    setGenerating(true);
    try {
      const created = await generateFlashcards(cert, settings, {
        count,
        domainId: domainId === ALL_DOMAINS ? undefined : domainId,
      });
      await loadCards();
      toast.success(
        "Flashcards ready",
        `Generated ${created.length} new ${created.length === 1 ? "card" : "cards"}.`,
      );
    } catch (err) {
      const e = err as AIError;
      toast.error("Failed", FRIENDLY_MESSAGES[e.code] ?? e.message);
    } finally {
      setGenerating(false);
    }
  }, [cert, settings, count, domainId, loadCards]);

  // Update one card in local state after a review/bookmark write.
  const handleCardUpdated = React.useCallback(
    (id: string, patch: Partial<Flashcard>) => {
      setCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      );
    },
    [],
  );

  const today = todayISO();
  const dueCards = React.useMemo(
    () => cards.filter((c) => c.srs.dueDate <= today),
    [cards, today],
  );
  const bookmarkedCards = React.useMemo(
    () => cards.filter((c) => c.bookmarked),
    [cards],
  );

  const visibleCards =
    tab === "due" ? dueCards : tab === "bookmarked" ? bookmarkedCards : cards;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Flashcards"
        description="Active recall with spaced repetition — flip, grade, and let the schedule do the rest."
      />

      {/* Generation */}
      <RequireApiKey>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Generate flashcards
            </CardTitle>
            <CardDescription>
              {cert.name} ({cert.code})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="space-y-1.5">
                <label
                  htmlFor="fc-count"
                  className="text-xs font-medium text-muted-foreground"
                >
                  How many
                </label>
                <Select
                  value={String(count)}
                  onValueChange={(v) => setCount(Number(v))}
                >
                  <SelectTrigger id="fc-count" className="w-full sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNT_OPTIONS.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} cards
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 sm:flex-1">
                <label
                  htmlFor="fc-domain"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Domain
                </label>
                <Select value={domainId} onValueChange={setDomainId}>
                  <SelectTrigger id="fc-domain" className="w-full">
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
                    Generate Flashcards
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </RequireApiKey>

      {/* Stats strip */}
      {!loading && cards.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <StatPill label="Total" value={cards.length} />
          <StatPill label="Due today" value={dueCards.length} accent="warning" />
          <StatPill
            label="Bookmarked"
            value={bookmarkedCards.length}
            accent="primary"
          />
        </div>
      )}

      {/* Body */}
      {loading ? (
        <DeckSkeleton />
      ) : cards.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No flashcards yet"
          description="Generate a set above to start studying with spaced repetition. Cards you review resurface exactly when you're about to forget them."
        />
      ) : (
        <Tabs value={tab} onValueChange={(v) => setTab(v as FilterTab)}>
          <TabsList>
            <TabsTrigger value="due">
              Due today
              {dueCards.length > 0 && (
                <span className="ml-1 rounded-full bg-warning/15 px-1.5 text-[11px] font-semibold text-warning">
                  {dueCards.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="bookmarked">
              Bookmarked
              {bookmarkedCards.length > 0 && (
                <span className="ml-1 rounded-full bg-primary/10 px-1.5 text-[11px] font-semibold text-primary">
                  {bookmarkedCards.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={tab}>
            {visibleCards.length === 0 ? (
              <EmptyState
                icon={Layers}
                title={
                  tab === "due"
                    ? "All caught up"
                    : tab === "bookmarked"
                      ? "No bookmarks yet"
                      : "Nothing here"
                }
                description={
                  tab === "due"
                    ? "You've reviewed everything due today. Come back tomorrow, or study the full set from the All tab."
                    : tab === "bookmarked"
                      ? "Bookmark cards while studying to build a focused review pile."
                      : "There are no cards in this view."
                }
              />
            ) : (
              <FlashcardDeck
                // Remount the deck when the active filter set changes so the
                // index/flip state resets cleanly to the first card.
                key={tab}
                cards={visibleCards}
                onCardUpdated={handleCardUpdated}
              />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function StatPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "warning" | "primary";
}) {
  return (
    <Card className="p-4">
      <p
        className={
          accent === "warning"
            ? "text-2xl font-bold tabular-nums text-warning"
            : accent === "primary"
              ? "text-2xl font-bold tabular-nums text-primary"
              : "text-2xl font-bold tabular-nums"
        }
      >
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  );
}

function DeckSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[4.5rem] rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-10 w-64 rounded-lg" />
      <div className="mx-auto w-full max-w-2xl space-y-5">
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-[22rem] w-full rounded-3xl sm:h-[24rem]" />
        <div className="flex justify-between">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
