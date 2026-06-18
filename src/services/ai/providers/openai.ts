import { OpenAICompatibleProvider } from "../base-provider";
import type { AIProviderId } from "@/types";

/**
 * OpenAI provider (placeholder — wired but not yet exposed in the UI).
 *
 * OpenAI's chat-completions API is the protocol the base provider implements,
 * so enabling it is purely a registry/UI change: add "openai" to the settings
 * options and the factory map.
 */
export class OpenAIProvider extends OpenAICompatibleProvider {
  readonly id: AIProviderId = "openai";
  readonly label = "OpenAI";
  readonly defaultModel = "gpt-4o-mini";
  protected readonly baseUrl = "https://api.openai.com/v1";
}
