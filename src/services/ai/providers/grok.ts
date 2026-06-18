import { OpenAICompatibleProvider } from "../base-provider";
import type { AIProviderId } from "@/types";

/**
 * Grok (xAI) provider. xAI exposes an OpenAI-compatible chat-completions API,
 * so this is a thin specialization of the shared base provider.
 *
 * Docs: https://docs.x.ai — endpoint https://api.x.ai/v1
 */
export class GrokProvider extends OpenAICompatibleProvider {
  readonly id: AIProviderId = "grok";
  readonly label = "Grok (xAI)";
  // xAI's current recommended model. Override per-request in Settings if needed.
  readonly defaultModel = "grok-4.3";
  protected readonly baseUrl = "https://api.x.ai/v1";
}
