# Contributing learning content

CertPath AI ships **community-reviewed content** (practice questions, flashcards,
cheat sheets) so the app is genuinely useful **without any API key**. This
content lives in version control and is improved through pull requests — that's
what makes it trustworthy, unlike raw AI output. Contributing content is one of
the most valuable ways to help students, and a great first PR.

## How it works

- Content lives in `src/content/<certification-id>.ts` as a typed `ContentPack`.
- On first load, packs are seeded into the user's IndexedDB (offline, no key).
  Seeded items are flagged `verified: true` and show a **Verified** badge.
- The AI generators *augment* this base; they never replace it.
- Each pack has a `version`. Bump it whenever you change content so corrections
  propagate to existing users (the seeder re-applies newer versions and replaces
  only the previously-seeded rows, leaving user-generated content untouched).

## Add or edit content

1. Open `src/content/<cert>.ts` (or create it and register it in
   `src/content/index.ts`).
2. Add entries to `questions`, `flashcards`, and/or `cheatSheets`.
3. **Bump `version`.**
4. Run the gate (`npm run typecheck && npm run lint && npm test`) and open a PR.

### Question shape

```ts
{
  type: "mcq",                 // "mcq" | "multi-select" | "scenario"
  difficulty: "medium",        // "easy" | "medium" | "hard"
  domainId: "design-secure",   // MUST match a domain id in the cert config
  topic: "Encryption",
  question: "…",
  options: ["A", "B", "C", "D"],
  correctIndices: [1],         // 0-based; multi-select has 2+
  explanation: "Why the correct answer is correct (and others aren't).",
}
```

### Flashcard shape

```ts
{ category: "IAM", difficulty: "easy", question: "Front", answer: "Back" }
```

### Cheat sheet shape

`topic`, `definition`, `architecture`, plus `useCases`, `bestPractices`,
`commonMistakes`, `examTips`, `interviewTips` (string arrays), and optional
`comparisonTables` (`{ title, headers, rows }`).

## Quality bar (reviewers enforce this)

- ✅ **Every fact is backed by an official source** (AWS/Azure/GCP/CNCF/etc.
  docs). Link sources in the PR description.
- ✅ `domainId` matches the certification config exactly.
- ✅ Explanations teach *why* — not just "the answer is B".
- ✅ No copying of real exam questions or third-party question banks (that's
  cheating and a copyright violation). Write original, concept-testing items.
- ✅ Multi-select questions have 2+ correct answers.
- ✅ Neutral, inclusive wording.

## Reporting an error without coding

Open a **📝 Content correction** issue with the exact text, the fix, and an
authoritative source. A maintainer or another contributor will turn it into a PR.

## A note on accuracy

Exams change. Verified content reflects contributors' best understanding at
review time and is **not affiliated with or endorsed by any certification
vendor**. Always cross-check critical details against current official docs.
