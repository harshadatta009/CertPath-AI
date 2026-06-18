import { OpenAICompatibleProvider } from "../base-provider";
import type { AIProviderId } from "@/types";

/**
 * Groq provider — ultra-fast inference for open models (Llama, GPT-OSS, …).
 *
 * Groq exposes an OpenAI-compatible API at https://api.groq.com/openai/v1, so
 * this is a thin specialization of the shared base provider. Keys start with
 * "gsk_". NOTE: Groq (fast inference) is a different company than Grok (xAI).
 *
 * Docs: https://console.groq.com/docs
 */
export class GroqProvider extends OpenAICompatibleProvider {
  readonly id: AIProviderId = "groq";
  readonly label = "Groq";
  // Solid general-purpose default with reliable JSON-mode support.
  readonly defaultModel = "llama-3.3-70b-versatile";
  protected readonly baseUrl = "https://api.groq.com/openai/v1";
}
