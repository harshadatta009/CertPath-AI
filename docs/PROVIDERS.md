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
| **Grok (xAI)** | ✅ Fully supported | OpenAI-compatible (`https://api.x.ai/v1`) |
| **OpenAI** | 🟡 Wired, hidden in UI | OpenAI-compatible (`https://api.openai.com/v1`) |
| **Claude (Anthropic)** | ⚪ Scaffolded | Needs Anthropic adapter |
| **Gemini (Google)** | ⚪ Scaffolded | Needs Gemini adapter |

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

## Case B — provider has its own protocol (Claude, Gemini)

Implement `AIProvider` directly (or build a small base mirroring
`OpenAICompatibleProvider`). Reuse the existing prompt builders and Zod schemas:

```ts
import { roadmapPrompt /* … */ } from "../prompts";
import { rawRoadmapSchema /* … */ } from "../schemas";

class ClaudeProvider implements AIProvider {
  // 1. map ChatMessage[] → the vendor's request shape
  // 2. POST to the vendor endpoint with the user's apiKey
  // 3. extract text → extractJson() → schema.safeParse() with retry
  // 4. return the validated raw object
}
```

The scaffolds live in `src/services/ai/providers/not-implemented.ts`; replace the
`fail()` bodies with real calls.

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
