# Provider integration guide

Every AI capability in CertPath AI goes through one interface, so the app never
depends on a specific vendor.

```ts
// src/services/ai/types.ts
export interface AIProvider {
  readonly id: AIProviderId;
  readonly label: string;
  readonly defaultModel: string;
  validateKey(): Promise<boolean>;
  generateRoadmap(req: RoadmapRequest): Promise<RawRoadmap>;
  generateQuestions(req: QuestionRequest): Promise<RawQuestion[]>;
  generateFlashcards(req: FlashcardRequest): Promise<RawFlashcard[]>;
  generateCheatSheet(req: CheatSheetRequest): Promise<RawCheatSheet>;
  generateInterviewQuestions(req: InterviewRequest): Promise<RawInterview[]>;
  generateRevisionPlan(req: RevisionRequest): Promise<RawRevisionPlan>;
}
```

## Current status

| Provider | Status | Transport |
| --- | --- | --- |
| **Groq** | ✅ Fully supported | OpenAI-compatible (`https://api.groq.com/openai/v1`) |
| **Grok (xAI)** | ✅ Fully supported | OpenAI-compatible (`https://api.x.ai/v1`) |
| **OpenAI** | ✅ Fully supported | OpenAI-compatible (`https://api.openai.com/v1`) |
| **Claude (Anthropic)** | ✅ Fully supported | Native Messages API (`https://api.anthropic.com/v1`) |
| **Gemini (Google)** | ✅ Fully supported | OpenAI-compatible (`https://generativelanguage.googleapis.com/v1beta/openai`) |

## Case A — provider speaks the OpenAI chat-completions protocol

This is the easy path (Grok, OpenAI, most gateways). Subclass the shared base —
prompts, JSON extraction, Zod validation and retry are inherited:

```ts
// src/services/ai/providers/openai.ts
import { OpenAICompatibleProvider } from "../base-provider";

export class OpenAIProvider extends OpenAICompatibleProvider {
  readonly id = "openai" as const;
  readonly label = "OpenAI";
  readonly defaultModel = "gpt-4o-mini";
  protected readonly baseUrl = "https://api.openai.com/v1";
}
```

## Case B — provider has its own protocol (Claude)

Extend `BaseLLMProvider` (the transport-agnostic base) and implement only the
two low-level methods — `chat()` and `validateKey()`. The prompt builders, JSON
extraction, Zod validation and retry loop are all inherited:

```ts
// src/services/ai/providers/anthropic.ts
import { BaseLLMProvider } from "../base-provider";

export class ClaudeProvider extends BaseLLMProvider {
  readonly id = "claude" as const;
  readonly label = "Claude (Anthropic)";
  readonly defaultModel = "claude-sonnet-4-6";

  protected async chat(messages: ChatMessage[]): Promise<string> {
    // 1. split system messages into the Messages API `system` field
    // 2. POST to /v1/messages with x-api-key + anthropic-version headers
    // 3. concatenate the returned content text blocks
  }

  async validateKey(): Promise<boolean> {
    /* a cheap chat() call; false on invalid_key */
  }
}
```

See `src/services/ai/providers/anthropic.ts` for the full implementation.
Gemini, despite being a different vendor, exposes an OpenAI-compatible endpoint,
so it uses Case A (`src/services/ai/providers/gemini.ts`).

## Register the provider (3 small edits)

1. **Factory** — add it to the registry in `src/services/ai/factory.ts`:
   ```ts
   const REGISTRY: Record<AIProviderId, ProviderCtor> = {
     grok: GrokProvider,
     openai: OpenAIProvider,
     claude: ClaudeProvider,
     gemini: GeminiProvider,
   };
   ```
2. **Metadata** — set `available: true` and fill `keyUrl`/`description` in the
   `PROVIDER_META` array (this controls the Settings dropdown).
3. **Type** — ensure the id is part of `AIProviderId` in
   `src/types/progress.ts`.

That's it — the Settings page, key validation, and all six generators work
automatically because they only ever call the interface.

## Contract & safety notes
- Providers must return **only** the raw JSON our Zod schemas expect (see
  `schemas.ts`). The base class already enforces `response_format: json_object`
  where supported and retries on malformed output.
- Throw a typed `AIError` (`src/services/ai/errors.ts`) for auth/rate-limit/
  network problems so the UI can recover gracefully.
- The API key must be sent **only** to the provider endpoint — never logged or
  forwarded anywhere else.
