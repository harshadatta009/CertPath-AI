# CertPath AI

> Pass certifications faster with personalized AI roadmaps. **Free & open source.**

<p>
  <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-blue.svg" />
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white" />
  <img alt="PRs welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" />
</p>

CertPath AI is a production-grade, **local-first, open-source** study platform
that turns a short profile into a complete, personalized certification program:
a day-by-day roadmap, practice questions, flashcards (with spaced repetition),
cheat sheets, interview prep, final-revision plans, progress tracking, and
exam-readiness scoring.

**Built for students, by the community.** It ships with **free, community-reviewed
study content** so it works immediately with **no API key and no account** — and
an optional LLM key unlocks unlimited AI-generated material on top.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/CHANGE-ME/certpath-ai)

> ⚠️ **Content disclaimer:** Study material is community-contributed and
> AI-assisted. It is **not affiliated with or endorsed by any certification
> vendor** and is no substitute for official documentation. Spotted an error?
> [Open a correction](.github/ISSUE_TEMPLATE/content_correction.yml) — it takes
> two minutes and helps every learner.

- **No login, no key required to start.** Ships with free, community-reviewed
  content (seeded into IndexedDB) so you can practice immediately and offline.
- **Bring your own key for unlimited AI.** Add a Groq or Grok (xAI) key to
  generate roadmaps and more material; OpenAI/Claude/Gemini are scaffolded. The
  key is stored only in your browser and sent *only* to the provider's API.
- **Community-owned content.** Questions, flashcards and cheat sheets live in the
  repo and improve via pull requests — see [docs/CONTENT.md](docs/CONTENT.md).
- **Offline-first.** All generated content is readable offline; only *new*
  generations need the network.
- **Multi-certification by design.** Nine exams ship today — AWS SAA-C03, Azure
  AZ-104, GCP ACE, Cisco CCNA, CKA, CKAD, Terraform Associate, RHCSA and CompTIA
  Security+. Adding more Azure, GCP,
  CKA/CKAD, Terraform, RHCSA, or CompTIA is **one config file** — no engine
  changes.

First supported exam: **AWS Certified Solutions Architect – Associate (SAA-C03)**.

---

## ✨ Features

| Engine | What it generates |
| --- | --- |
| **Roadmap** | Month → week → day plan with topics, objectives, hands-on labs, revision targets, practice counts and exam tips |
| **Questions** | MCQ / multi-select / scenario questions (easy/medium/hard) with explanations, de-duplicated and stored locally; interactive quiz mode records per-domain mastery |
| **Flashcards** | Q/A cards with 3D flip, SM-2 spaced repetition, bookmarking, due-today filtering |
| **Cheat Sheets** | Definition, architecture, use cases, best practices, common mistakes, comparison tables, exam & interview tips |
| **Interview** | Beginner→advanced technical, system-design, behavioral & scenario questions with model answers and follow-ups |
| **Revision** | 30/15/7-day, last-week, 48h, 24h and exam-day plans + interactive exam-day checklist |
| **Analytics** | Readiness score, predicted pass probability, completion %, study streak, consistency, weak/strong domains, recommended topics |
| **Everywhere** | Dark/light mode, mobile responsive, loading skeletons, empty states, error boundaries, client-side **PDF export** |

---

## 🧱 Tech stack

Next.js 16 (App Router, Turbopack) · TypeScript · TailwindCSS · shadcn/ui-style primitives ·
Framer Motion · Zustand · React Hook Form · Zod · Dexie (IndexedDB) · Recharts ·
TanStack Query · Lucide · date-fns · next-themes · jsPDF · Vitest · Testing
Library · Playwright.

---

## 🚀 Getting started

```bash
# 1. Install
npm install

# 2. Run the dev server
npm run dev
# → http://localhost:3000

# 3. Add your key
#    Open Settings, choose "Grok (xAI)", paste your key (get one at
#    https://console.x.ai), click "Validate Key".

# 4. Generate
#    Go to "Generate", fill in your profile, and create your roadmap.
```

No environment variables are required — see [.env.example](.env.example).

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (next/core-web-vitals) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest unit/component tests |
| `npm run test:e2e` | Playwright end-to-end tests |

---

## 📁 Folder structure

```
src/
  app/                      # Next.js App Router
    (app)/                  # Authenticated-feeling shell (sidebar + header)
      dashboard/  roadmap/  questions/  flashcards/
      cheatsheets/  interview/  revision/  analytics/  settings/  generate/
    layout.tsx  page.tsx    # Root layout + marketing landing page
    globals.css             # Theme tokens (light/dark) + utilities
  components/
    ui/                     # shadcn-style primitives (button, card, dialog, …)
    layout/                 # sidebar, header, app shell
    shared/                 # page-header, empty-state, error-boundary, stat-card, require-api-key
    theme-toggle.tsx
  features/                 # Feature-scoped UI (roadmap, analytics, questions, …)
  hooks/                    # use-active-certification, use-analytics
  providers/                # theme, react-query, app providers + hydration
  services/                 # Business logic (no UI)
    ai/                     # Provider abstraction, prompts, schemas, factory
    roadmap-service.ts  content-service.ts  analytics-service.ts
  store/                    # Zustand stores (settings, roadmap)
  database/                 # Dexie schema (db.ts) + repositories.ts
  constants/                # certifications/ registry + navigation
  types/                    # Domain types
  lib/                      # utils, pdf builder
tests/                      # unit/ (Vitest) + e2e/ (Playwright)
docs/                       # ARCHITECTURE, PROVIDERS, CERTIFICATIONS
```

---

## 🏗️ Architecture at a glance

```
            ┌──────────────────────────────────────────────┐
            │                  UI (App Router)               │
            │  pages → features → components/ui (shadcn)      │
            └───────────────┬───────────────┬────────────────┘
                            │               │
                   Zustand stores      React Query / hooks
                            │               │
            ┌───────────────▼───────────────▼────────────────┐
            │                  Service layer                  │
            │  roadmap-service · content-service · analytics  │
            └───────┬───────────────────────┬─────────────────┘
                    │                       │
        ┌───────────▼──────────┐   ┌────────▼───────────────┐
        │   AI provider layer  │   │   Repository layer      │
        │  AIProvider (iface)  │   │  roadmapRepo, questionRepo …
        │  Grok | OpenAI | …   │   │        (Dexie)          │
        │  Zod-validated JSON  │   └────────┬───────────────┘
        └──────────┬───────────┘            │
                   │                  ┌──────▼──────┐
            provider HTTP API         │  IndexedDB  │
                                      └─────────────┘
```

Principles: **SOLID**, **Clean Architecture**, **feature-based structure**,
**Repository Pattern**, **service layer**, and **dependency inversion** (the app
depends on the `AIProvider` interface, never a concrete provider). See
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## 🔌 Bring your own AI provider

The whole app talks to a single `AIProvider` interface. Grok (xAI) is fully
implemented; OpenAI is wired (OpenAI-compatible transport) and Claude/Gemini are
scaffolded. Adding/finishing a provider is a small, isolated change — see
[docs/PROVIDERS.md](docs/PROVIDERS.md).

Your key is stored in IndexedDB and used only to call the provider directly.

---

## ➕ Add a new certification

Create one config file describing domains, topics, weightages and exam metadata,
register it, and the entire app (picker, roadmap, questions, analytics, …) lights
up. Step-by-step guide: [docs/CERTIFICATIONS.md](docs/CERTIFICATIONS.md).

---

## ✅ Quality

- `npm run typecheck` — clean.
- `npm run build` — all routes compile & prerender as static.
- `npm test` — 26 unit/component tests (analytics, SRS, roadmap builder, JSON
  extraction, IndexedDB repository, component render).
- `npm run test:e2e` — Playwright smoke tests for the critical flows.

---

## ☁️ Deploy

Push to a Git host and import into **Vercel** — zero configuration. The app is
fully client-side (no server secrets), so any static-capable Next.js host works.

---

## 🤝 Contributing — help students learn

CertPath AI is community-driven and **PRs are welcome**. The highest-impact ways
to help:

- **📝 Improve content** — add or correct practice questions, flashcards and
  cheat sheets in [`src/content/`](src/content). Guide: [docs/CONTENT.md](docs/CONTENT.md).
- **🎓 Add a certification** — one config file lights up the whole app. Guide:
  [docs/CERTIFICATIONS.md](docs/CERTIFICATIONS.md).
- **🔌 Add an AI provider** — Grok/Groq work today; help finish Claude/Gemini.
  Guide: [docs/PROVIDERS.md](docs/PROVIDERS.md).
- **🐛 Fix bugs / ✨ build features** — see open issues labeled `good first issue`.

Start with [CONTRIBUTING.md](CONTRIBUTING.md) and our
[Code of Conduct](CODE_OF_CONDUCT.md). Found a security issue? See
[SECURITY.md](SECURITY.md).

## 📄 License

[MIT](LICENSE) — free to use, modify, and share. Help us help more learners. ⭐
