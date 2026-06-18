import { AIError } from "../errors";
import type { AIProvider, ProviderConfig } from "../types";
import type { AIProviderId } from "@/types";

/**
 * Base for providers that are registered but not yet wired to a real endpoint
 * (Claude, Gemini). They satisfy the AIProvider contract so the factory and UI
 * can list them, but every call fails fast with a clear message. Implementing a
 * real provider means: swap this base for the appropriate transport (the
 * OpenAI-compatible base, or a bespoke Anthropic/Gemini adapter) and fill in the
 * request/response mapping — the rest of the app already speaks the interface.
 */
export abstract class NotImplementedProvider implements AIProvider {
  abstract readonly id: AIProviderId;
  abstract readonly label: string;
  abstract readonly defaultModel: string;

  constructor(config: ProviderConfig) {
    void config;
  }

  private fail(): never {
    throw new AIError(
      "unknown",
      `${this.label} support is coming soon. Switch to Grok in Settings for now.`,
    );
  }

  async validateKey(): Promise<boolean> {
    return false;
  }
  generateRoadmap = () => this.fail();
  generateRoadmapOutline = () => this.fail();
  generateRoadmapDays = () => this.fail();
  generateQuestions = () => this.fail();
  generateFlashcards = () => this.fail();
  generateCheatSheet = () => this.fail();
  generateInterviewQuestions = () => this.fail();
  generateRevisionPlan = () => this.fail();
}

export class ClaudeProvider extends NotImplementedProvider {
  readonly id: AIProviderId = "claude";
  readonly label = "Claude (Anthropic)";
  readonly defaultModel = "claude-sonnet-4-6";
}

export class GeminiProvider extends NotImplementedProvider {
  readonly id: AIProviderId = "gemini";
  readonly label = "Gemini (Google)";
  readonly defaultModel = "gemini-1.5-pro";
}
