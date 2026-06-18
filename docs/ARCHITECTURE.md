# Architecture

CertPath AI is a local-first single-page application built on Next.js 15. There
is no backend and no database server — all state lives in the browser
(IndexedDB), and the only network calls are direct, client-side requests to the
user's chosen LLM provider.

## Layers

The codebase is organized into strict layers with a one-directional dependency
flow (UI → services → {AI providers, repositories} → IndexedDB / HTTP):

### 1. UI layer (`src/app`, `src/features`, `src/components`)
- **`app/`** — App Router routes. The `(app)` route group renders the shell
  (sidebar + header). The root `page.tsx` is the public marketing landing page.
- **`features/`** — feature-scoped composite components (e.g. `roadmap-view`,
  `analytics/charts`, `questions/quiz`). Feature folders never import from each
  other; shared building blocks live in `components/`.
- **`components/ui`** — shadcn/ui-style primitives built on Radix + CVA.
- **`components/shared`** — cross-cutting building blocks (`PageHeader`,
  `EmptyState`, `ErrorBoundary`, `StatCard`, `RequireApiKey`).

### 2. State (`src/store`, `src/hooks`, `src/providers`)
- **Zustand stores** hold app state that multiple routes share:
  - `settings-store` — provider, API key, theme, active roadmap, key validation.
  - `roadmap-store` — roadmaps, active roadmap, day completions, generation flag.
- **Hooks** derive view-models (`use-analytics` computes the snapshot;
  `use-active-certification` resolves the current cert config).
- **Providers** wire theme, React Query, the toaster, and IndexedDB hydration.

### 3. Service layer (`src/services`)
Pure-ish business logic with **no UI imports**:
- `roadmap-service` — orchestrates generation and maps raw AI JSON → `Roadmap`
  (assigning ids, dates, week/month grouping, hour totals).
- `content-service` — questions (+ hashing/dedup), flashcards (+ SM-2 SRS),
  cheat sheets, interview questions, revision plans.
- `analytics-service` — **pure functions** for readiness, pass probability,
  streak, consistency, domain mastery. Fully offline and unit-tested.

### 4. AI provider layer (`src/services/ai`)
- `types.ts` — the `AIProvider` interface every provider implements.
- `base-provider.ts` — `OpenAICompatibleProvider` with shared transport, robust
  JSON extraction, **Zod validation**, and **retry with backoff**.
- `prompts.ts` — prompt builders that force structured JSON and embed real
  domain ids.
- `schemas.ts` — Zod schemas describing the *raw* JSON contract. Every response
  is validated; invalid responses trigger a retry.
- `providers/` — `GrokProvider`, `OpenAIProvider`, and scaffolded
  `Claude`/`Gemini`.
- `factory.ts` — id → provider constructor registry + provider metadata.

### 5. Persistence (`src/database`)
- `db.ts` — the Dexie schema (`roadmaps`, `questions`, `flashcards`,
  `cheatsheets`, `interviews`, `revisions`, `completions`, `sessions`,
  `attempts`, `notes`, `settings`). Created lazily and only in the browser.
- `repositories.ts` — the **only** module that touches Dexie. Services and
  stores depend on repositories, keeping persistence swappable (Repository
  Pattern).

## Data flow: generating a roadmap

```
ProfileForm (RHF + Zod)
  → roadmap-store.generate(profile, settings)
    → roadmap-service.generateRoadmap()
      → createProvider(settings.provider, {apiKey})   // factory
        → GrokProvider.generateRoadmap()              // AIProvider
          → prompts.roadmapPrompt() → chat() → extractJson() → Zod validate (retry)
      → buildRoadmap(raw, cert, profile)              // map → entity
      → roadmapRepo.save(roadmap)                     // IndexedDB
  → store updates → RoadmapView re-renders
```

## Offline behavior
- Reading roadmaps, progress, notes, flashcards, cheat sheets and analytics works
  fully offline (IndexedDB).
- Only *new* AI generations require connectivity. Network/validation failures are
  surfaced as typed `AIError`s with friendly recovery messaging.

## Error handling
`AIError` carries a discriminated `code` (`invalid_key`, `rate_limit`, `network`,
`malformed_response`, `empty_response`, `timeout`, `unknown`) and a `retryable`
flag. `FRIENDLY_MESSAGES` maps codes to user-facing copy; the UI shows toasts and
`ErrorBoundary` catches render-time failures.

## Why no auth / no server?
The product is a personal productivity tool. Removing auth and servers makes it
instant to use, private by default (the key never leaves the device except to the
provider), trivially deployable as static output, and resilient offline.
