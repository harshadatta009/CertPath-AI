import { z } from "zod";
import { sleep } from "@/lib/utils";
import { AIError, toAIError } from "./errors";
import type {
  AIProvider,
  ProviderConfig,
  RoadmapRequest,
  QuestionRequest,
  FlashcardRequest,
  CheatSheetRequest,
  InterviewRequest,
  RevisionRequest,
} from "./types";
import type { AIProviderId } from "@/types";
import {
  type ChatMessage,
  roadmapPrompt,
  questionsPrompt,
  flashcardsPrompt,
  cheatSheetPrompt,
  interviewPrompt,
  revisionPrompt,
} from "./prompts";
import {
  rawRoadmapSchema,
  rawQuestionsSchema,
  rawFlashcardsSchema,
  rawCheatSheetSchema,
  rawInterviewListSchema,
  rawRevisionPlanSchema,
} from "./schemas";

/**
 * Extract the first balanced JSON object from arbitrary model text. Models
 * sometimes wrap JSON in prose or code fences despite instructions; this makes
 * parsing resilient without trusting the model to be perfect.
 */
export function extractJson(text: string): unknown {
  if (!text || !text.trim()) {
    throw new AIError("empty_response", "The AI returned no content.");
  }
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new AIError("malformed_response", "No JSON object found in response.");
  }
  const slice = candidate.slice(start, end + 1);
  try {
    return JSON.parse(slice);
  } catch (err) {
    throw new AIError("malformed_response", "Response was not valid JSON.", true, err);
  }
}

/**
 * Base for OpenAI-compatible chat-completions APIs (xAI/Grok and OpenAI both
 * speak this protocol). Concrete providers supply the base URL and model.
 */
export abstract class OpenAICompatibleProvider implements AIProvider {
  abstract readonly id: AIProviderId;
  abstract readonly label: string;
  abstract readonly defaultModel: string;
  protected abstract readonly baseUrl: string;

  protected readonly apiKey: string;
  protected readonly model?: string;
  protected readonly maxRetries = 2;

  constructor(config: ProviderConfig) {
    this.apiKey = config.apiKey?.trim() ?? "";
    this.model = config.model?.trim() || undefined;
    if (!this.apiKey) {
      throw new AIError("invalid_key", "No API key configured. Add one in Settings.");
    }
  }

  protected get activeModel(): string {
    return this.model || this.defaultModel;
  }

  /** Low-level chat call returning raw assistant text. */
  protected async chat(messages: ChatMessage[], opts?: { json?: boolean }): Promise<string> {
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.activeModel,
          messages,
          temperature: 0.4,
          ...(opts?.json ? { response_format: { type: "json_object" } } : {}),
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
      // Try to surface the provider's own error message (xAI/OpenAI both nest it).
      let detail = body.slice(0, 300);
      try {
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
      | { choices?: Array<{ message?: { content?: string } }> }
      | null;
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new AIError("empty_response", "The AI returned an empty message.");
    return content;
  }

  /**
   * Generate + validate against a Zod schema, retrying on malformed/empty/
   * rate-limit/network errors with exponential backoff.
   */
  protected async generateValidated<S extends z.ZodTypeAny>(
    messages: ChatMessage[],
    schema: S,
  ): Promise<z.infer<S>> {
    let lastError: AIError | null = null;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const reinforced =
          attempt === 0
            ? messages
            : [
                ...messages,
                {
                  role: "user" as const,
                  content:
                    "Your previous response could not be parsed. Return ONLY the valid JSON object, nothing else.",
                },
              ];
        const text = await this.chat(reinforced, { json: true });
        const json = extractJson(text);
        const parsed = schema.safeParse(json);
        if (parsed.success) return parsed.data;
        lastError = new AIError(
          "malformed_response",
          `Response failed validation: ${parsed.error.issues.map((i) => i.path.join(".")).join(", ")}`,
          true,
        );
      } catch (err) {
        lastError = toAIError(err);
        if (!lastError.retryable) throw lastError;
      }
      if (attempt < this.maxRetries) await sleep(500 * (attempt + 1));
    }
    throw lastError ?? new AIError("unknown", "Generation failed.");
  }

  async validateKey(): Promise<boolean> {
    try {
      await this.chat(
        [
          { role: "system", content: "Reply with the single word: ok" },
          { role: "user", content: "ping" },
        ],
      );
      return true;
    } catch (err) {
      const e = toAIError(err);
      if (e.code === "invalid_key") return false;
      throw e;
    }
  }

  // High-level generation — shared by every OpenAI-compatible provider.
  async generateRoadmap(req: RoadmapRequest) {
    return this.generateValidated(roadmapPrompt(req), rawRoadmapSchema);
  }

  async generateQuestions(req: QuestionRequest) {
    const { questions } = await this.generateValidated(
      questionsPrompt(req),
      rawQuestionsSchema,
    );
    return questions;
  }

  async generateFlashcards(req: FlashcardRequest) {
    const { flashcards } = await this.generateValidated(
      flashcardsPrompt(req),
      rawFlashcardsSchema,
    );
    return flashcards;
  }

  async generateCheatSheet(req: CheatSheetRequest) {
    return this.generateValidated(cheatSheetPrompt(req), rawCheatSheetSchema);
  }

  async generateInterviewQuestions(req: InterviewRequest) {
    const { questions } = await this.generateValidated(
      interviewPrompt(req),
      rawInterviewListSchema,
    );
    return questions;
  }

  async generateRevisionPlan(req: RevisionRequest) {
    return this.generateValidated(revisionPrompt(req), rawRevisionPlanSchema);
  }
}
