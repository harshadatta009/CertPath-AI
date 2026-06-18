import { create } from "zustand";
import { roadmapRepo, progressRepo } from "@/database/repositories";
import { generateRoadmap as runGeneration } from "@/services/roadmap-service";
import { getCertificationOrThrow } from "@/constants/certifications";
import { uid } from "@/lib/utils";
import { formatISO } from "date-fns";
import type { Roadmap, UserProfile, AppSettings, DayCompletion } from "@/types";

interface RoadmapState {
  roadmaps: Roadmap[];
  active: Roadmap | null;
  completions: DayCompletion[];
  generating: boolean;
  loaded: boolean;

  load: (activeId: string | null) => Promise<void>;
  generate: (profile: UserProfile, settings: AppSettings) => Promise<Roadmap>;
  setActive: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  toggleDay: (dayId: string, actualHours?: number) => Promise<void>;
  isDayComplete: (dayId: string) => boolean;
}

export const useRoadmapStore = create<RoadmapState>((set, get) => ({
  roadmaps: [],
  active: null,
  completions: [],
  generating: false,
  loaded: false,

  async load(activeId) {
    const roadmaps = await roadmapRepo.getAll();
    const active =
      roadmaps.find((r) => r.id === activeId) ?? roadmaps[0] ?? null;
    const completions = active
      ? await progressRepo.completionsForRoadmap(active.id)
      : [];
    set({ roadmaps, active, completions, loaded: true });
  },

  async generate(profile, settings) {
    set({ generating: true });
    try {
      const cert = getCertificationOrThrow(profile.certificationId);
      const roadmap = await runGeneration(cert, profile, settings);
      const roadmaps = await roadmapRepo.getAll();
      set({ roadmaps, active: roadmap, completions: [] });
      return roadmap;
    } finally {
      set({ generating: false });
    }
  },

  async setActive(id) {
    const active = await roadmapRepo.get(id);
    if (!active) return;
    const completions = await progressRepo.completionsForRoadmap(id);
    set({ active, completions });
  },

  async remove(id) {
    await roadmapRepo.remove(id);
    const roadmaps = await roadmapRepo.getAll();
    const wasActive = get().active?.id === id;
    const active = wasActive ? roadmaps[0] ?? null : get().active;
    const completions = active
      ? await progressRepo.completionsForRoadmap(active.id)
      : [];
    set({ roadmaps, active, completions });
  },

  async toggleDay(dayId, actualHours) {
    const { active, completions } = get();
    if (!active) return;
    const existing = completions.find((c) => c.dayId === dayId);
    const completed = !existing?.completed;
    const day = active.days.find((d) => d.id === dayId);
    const record: DayCompletion = {
      id: existing?.id ?? uid("comp"),
      roadmapId: active.id,
      dayId,
      completed,
      completedAt: completed ? Date.now() : null,
      actualHours: actualHours ?? existing?.actualHours ?? day?.estimatedHours ?? 0,
    };
    await progressRepo.setDayCompletion(record);

    // Log a study session on completion so streak/consistency reflect it.
    if (completed) {
      await progressRepo.addSession({
        id: uid("sess"),
        roadmapId: active.id,
        date: formatISO(new Date(), { representation: "date" }),
        hours: record.actualHours,
        createdAt: Date.now(),
      });
    }

    const next = completions.filter((c) => c.dayId !== dayId);
    next.push(record);
    set({ completions: next });
  },

  isDayComplete(dayId) {
    return Boolean(get().completions.find((c) => c.dayId === dayId)?.completed);
  },
}));
