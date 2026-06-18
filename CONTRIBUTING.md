# Contributing to CertPath AI

Thanks for your interest! This guide covers local setup, conventions, and where
to make common changes.

## Setup

```bash
npm install
npm run dev
```

No environment variables are required (the app uses a user-supplied key stored in
IndexedDB).

## Before you push

Run the full local gate:

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm test            # vitest unit/component tests
npm run build       # production build (also type-checks routes)
```

End-to-end (optional, starts a dev server automatically):

```bash
npm run test:e2e
```

## Conventions

- **TypeScript strict** — no `any` except a narrow `err as AIError` cast in
  catch blocks. Prefer precise domain types from `src/types`.
- **Layering** — UI never imports Dexie directly; go through `repositories.ts`.
  Services contain business logic and have no React/UI imports. The app depends
  on the `AIProvider` interface, never a concrete provider.
- **Feature isolation** — feature folders (`src/features/*`) don't import each
  other. Promote anything shared into `src/components` or `src/lib`.
- **Styling** — Tailwind with **semantic tokens** (`bg-card`,
  `text-muted-foreground`, `bg-primary`, `text-success`, …) so light/dark mode
  both work. Reuse `components/ui` primitives; don't hardcode hex colors in
  components.
- **Animations** — Framer Motion for entrances/transitions; keep them subtle.
- **Accessibility** — label controls, add `aria-*` to icon-only buttons, keep
  keyboard navigation working.

## Common tasks

| I want to… | Go to |
| --- | --- |
| Add/finish an AI provider | [docs/PROVIDERS.md](docs/PROVIDERS.md) |
| Add a certification | [docs/CERTIFICATIONS.md](docs/CERTIFICATIONS.md) |
| Change generation prompts | `src/services/ai/prompts.ts` (+ `schemas.ts`) |
| Adjust scoring/readiness | `src/services/analytics-service.ts` (+ tests) |
| Add a DB table/index | `src/database/db.ts` (bump the Dexie version) + `repositories.ts` |
| Add a UI primitive | `src/components/ui/` |

## Commit & PR

- Keep PRs focused; include a short description of the change and any UX notes.
- Add/adjust tests for service-layer logic (`tests/unit`) and critical flows
  (`tests/e2e`).
- Ensure the full gate above passes.

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the layer diagram and data
flow.
