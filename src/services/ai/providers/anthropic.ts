import { BaseLLMProvider } from "../base-provider";
import { AIError, toAIError } from "../errors";
import type { ChatMessage } from "../prompts";
import type { AIProviderId } from "@/types";

/**
 * Claude (Anthropic) provider.
 *
 * Unlike Groq/Grok/OpenAI, Anthropic does NOT speak the OpenAI
 * chat-completions protocol — it has its own native Messages API
 * (https://docs.claude.com/en/api/messages). So this provider extends the
 * transport-agnostic BaseLLMProvider directly and implements `chat()` against
 * the Messages API rather than reusing the OpenAI-compatible base. The shared
 * generate-and-validate-and-retry logic lives in BaseLLMProvider, so only the
 * single-turn transport differs here.
 *
 * Key differences from the OpenAI shape this maps over:
 *  - Auth header is `x-api-key`, not `Authorization: Bearer`.
 *  - The system prompt is a top-level `system` field, not a message turn.
 *  - `max_tokens` is required (OpenAI lets it default).
 *  - JSON is requested via prompt instructions (the prompts already do this)
 *    plus our resilient extractJson, since the Messages API has no
 *    `response_format` json-object switch like OpenAI's.
 *  - Browsers need the explicit direct-access header for CORS, since keys are
 *    stored client-side and calls go straight to Anthropic.
 */
export class ClaudeProvider extends BaseLLMProvider {
  readonly id: AIProviderId = "claude";
  readonly label = "Claude (Anthropic)";
  readonly defaultModel = "claude-sonnet-4-6";
  protected readonly baseUrl = "https://api.anthropic.com/v1";
  /** Pinned API version — see https://docs.claude.com/en/api/versioning. */
  private readonly apiVersion = "2023-06-01";
  /** Kept under the SDK's non-streaming HTTP-timeout threshold (~16K). */
  private readonly maxTokens = 16000;

  /** Low-level chat call against the native Messages API. */
  protected async chat(messages: ChatMessage[]): Promise<string> {
    // Anthropic splits the system prompt out of the message turns.
    const system = messages
      .filter((m) => m.role === "system")
      .map((m) => m.content)
      .join("\n\n");
    const turns = messages
      .filter((m) => m.role === "user")
      .map((m) => ({ role: "user" as const, content: m.content }));

    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": this.apiVersion,
          // Required to allow direct browser calls (keys live client-side).
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: this.activeModel,
          max_tokens: this.maxTokens,
          ...(system ? { system } : {}),
          messages: turns,
        }),
      });
    } catch (err) {
      throw new AIError("network", "Network request to the AI provider failed.", true, err);
    }

    if (res.status === 401 || res.status === 403) {
      throw new AIError("invalid_key", "The API key was rejected (401/403).");
    }
    if (res.status === 429) {
      throw new AIError("rate_limit", "Rate limited by the provider (429).", true);
    }
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      let detail = body.slice(0, 300);
      try {
        // Anthropic nests the message at error.message.
        const parsed = JSON.parse(body) as { error?: { message?: string } | string };
        detail =
          (typeof parsed.error === "string" ? parsed.error : parsed.error?.message) ?? detail;
      } catch {
        /* keep raw body */
      }
      if (res.status === 400) {
        throw new AIError(
          "unknown",
          `Request rejected (400). This usually means the model id "${this.activeModel}" is invalid for your account — set a valid model in Settings. Provider said: ${detail}`,
        );
      }
      throw new AIError("unknown", `Provider error ${res.status}: ${detail}`, res.status >= 500);
    }

    const data = (await res.json().catch(() => null)) as
      | {
          stop_reason?: string;
          content?: Array<{ type?: string; text?: string }>;
        }
      | null;

    if (data?.stop_reason === "refusal") {
      throw new AIError("unknown", "Claude declined to generate a response for this request.");
    }

    // Concatenate the text blocks (Messages API returns a content-block array).
    const text = (data?.content ?? [])
      .filter((b) => b.type === "text" && typeof b.text === "string")
      .map((b) => b.text)
      .join("");
    if (!text) throw new AIError("empty_response", "The AI returned an empty message.");
    return text;
  }

  async validateKey(): Promise<boolean> {
    try {
      await this.chat([
        { role: "system", content: "Reply with the single word: ok" },
        { role: "user", content: "ping" },
      ]);
      return true;
    } catch (err) {
      const e = toAIError(err);
      if (e.code === "invalid_key") return false;
      throw e;
    }
  }
}
