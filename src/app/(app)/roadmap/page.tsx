"use client";

import * as React from "react";
import Link from "next/link";
import { Map, Plus, Download, Trash2, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { RoadmapView } from "@/features/roadmap/roadmap-view";
import { exportRoadmapPdf } from "@/features/roadmap/export-roadmap";
import { useRoadmapStore } from "@/store/roadmap-store";
import { useSettingsStore } from "@/store/settings-store";

export default function RoadmapPage() {
  const { roadmaps, active, loaded, setActive, remove } = useRoadmapStore();
  const setActiveRoadmap = useSettingsStore((s) => s.setActiveRoadmap);

  if (!loaded) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!active) {
    return (
      <div className="space-y-6">
        <PageHeader title="Roadmap" description="Your personalized study plan lives here." />
        <EmptyState
          icon={Map}
          title="No roadmap yet"
          description="Generate a personalized, day-by-day study plan tailored to your experience and exam date."
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

  async function handleDelete() {
    if (!active) return;
    await remove(active.id);
    toast.success("Roadmap deleted");
  }

  async function handleSwitch(id: string) {
    await setActive(id);
    await setActiveRoadmap(id);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roadmap"
        description="Track your day-by-day plan. Tick days off as you complete them."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {roadmaps.length > 1 && (
              <Select value={active.id} onValueChange={handleSwitch}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roadmaps.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" size="sm" onClick={() => exportRoadmapPdf(active)}>
              <Download className="h-4 w-4" /> PDF
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/generate">
                <Plus className="h-4 w-4" /> New
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDelete} aria-label="Delete roadmap">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        }
      />
      <RoadmapView roadmap={active} />
    </div>
  );
}
