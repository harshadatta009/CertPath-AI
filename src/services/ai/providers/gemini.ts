import { OpenAICompatibleProvider } from "../base-provider";
import type { AIProviderId } from "@/types";

/**
 * Gemini (Google) provider.
 *
 * Google exposes an OpenAI-compatible chat-completions endpoint for Gemini, so
 * this is a thin specialization of the shared base provider — same as Groq and
 * Grok. The compatibility layer accepts `Authorization: Bearer <key>` and the
 * `response_format` json-object switch the base provider relies on.
 *
 * Docs: https://ai.google.dev/gemini-api/docs/openai
 * Endpoint: https://generativelanguage.googleapis.com/v1beta/openai
 */
export class GeminiProvider extends OpenAICompatibleProvider {
  readonly id: AIProviderId = "gemini";
  readonly label = "Gemini (Google)";
  readonly defaultModel = "gemini-1.5-pro";
  protected readonly baseUrl = "https://generativelanguage.googleapis.com/v1beta/openai";
}
