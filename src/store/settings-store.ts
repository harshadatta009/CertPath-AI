import { create } from "zustand";
import { settingsRepo } from "@/database/repositories";
import { createProvider } from "@/services/ai";
import { toAIError } from "@/services/ai/errors";
import type { AppSettings, AIProviderId } from "@/types";

const DEFAULTS: AppSettings = {
  id: "singleton",
  provider: "groq",
  apiKey: "",
  model: "",
  theme: "system",
  activeRoadmapId: null,
  keyValidatedAt: null,
  createdAt: 0,
  updatedAt: 0,
};

type KeyStatus = "unknown" | "valid" | "invalid" | "checking";

interface SettingsState {
  settings: AppSettings;
  loaded: boolean;
  keyStatus: KeyStatus;
  hydrate: () => Promise<void>;
  update: (patch: Partial<AppSettings>) => Promise<void>;
  setProvider: (provider: AIProviderId) => Promise<void>;
  setActiveRoadmap: (id: string | null) => Promise<void>;
  validateKey: () => Promise<boolean>;
  hasKey: () => boolean;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULTS,
  loaded: false,
  keyStatus: "unknown",

  async hydrate() {
    const existing = await settingsRepo.get();
    if (existing) {
      set({
        settings: existing,
        loaded: true,
        keyStatus: existing.keyValidatedAt ? "valid" : "unknown",
      });
    } else {
      const now = Date.now();
      const seeded = { ...DEFAULTS, createdAt: now, updatedAt: now };
      await settingsRepo.save(seeded);
      set({ settings: seeded, loaded: true });
    }
  },

  async update(patch) {
    await settingsRepo.update(patch);
    const next = await settingsRepo.get();
    if (next) {
      set((s) => ({
        settings: next,
        keyStatus: patch.apiKey !== undefined ? "unknown" : s.keyStatus,
      }));
    }
  },

  async setProvider(provider) {
    await get().update({ provider, keyValidatedAt: null });
    set({ keyStatus: "unknown" });
  },

  async setActiveRoadmap(id) {
    await get().update({ activeRoadmapId: id });
  },

  async validateKey() {
    const { settings } = get();
    if (!settings.apiKey) {
      set({ keyStatus: "invalid" });
      return false;
    }
    set({ keyStatus: "checking" });
    try {
      const provider = createProvider(settings.provider, {
        apiKey: settings.apiKey,
        model: settings.model,
      });
      const ok = await provider.validateKey();
      set({ keyStatus: ok ? "valid" : "invalid" });
      if (ok) await get().update({ keyValidatedAt: Date.now() });
      return ok;
    } catch (err) {
      set({ keyStatus: "invalid" });
      throw toAIError(err);
    }
  },

  hasKey() {
    return Boolean(get().settings.apiKey);
  },
}));
