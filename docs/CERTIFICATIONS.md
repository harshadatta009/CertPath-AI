# Adding a new certification

Adding a certification is intentionally a **single-file** change. The roadmap
generator, question/flashcard/cheat-sheet/interview/revision engines, analytics,
the picker, and PDF export all read from the certification registry — none of
them are hard-coded to AWS.

## 1. Create the config file

Add `src/constants/certifications/<your-cert>.ts`:

```ts
import type { CertificationConfig } from "@/types";

export const az104: CertificationConfig = {
  id: "az-104",                 // stable, unique
  provider: "azure",            // aws | azure | gcp | kubernetes | hashicorp | redhat | comptia
  code: "AZ-104",
  name: "Azure Administrator Associate",
  tagline: "Manage Azure identities, storage, compute and networking.",
  description: "…",
  level: "associate",           // foundational | associate | professional | specialty
  color: "#0078D4",             // brand accent for cards
  recommendedHours: 110,
  tags: ["azure", "cloud", "associate"],
  available: true,              // selectable once true
  exam: {
    questionCount: 50,
    durationMinutes: 120,
    passingScore: 700,
    maxScore: 1000,
    priceUsd: 165,
    formats: ["mcq", "multi-select", "scenario"],
    validityYears: 1,
  },
  domains: [
    {
      id: "identity-governance", // domainIds must be stable — analytics + AI use them
      name: "Manage identities and governance",
      weightage: 20,             // domains should sum to ~100
      recommendedHours: 22,
      topics: [
        { id: "entra-users", name: "Microsoft Entra users & groups", weight: 4 },
        { id: "rbac", name: "Role-based access control (RBAC)", weight: 4 },
        // …
      ],
    },
    // … more domains
  ],
};
```

### Field guidance
- **`id`** and **`domains[].id`** are persisted on generated content and used by
  analytics — keep them stable once shipped.
- **`weightage`** should reflect the official exam guide; the roadmap generator
  allocates study days proportionally and analytics weights mastery by it.
- **`color`** drives the card accent and roadmap header.
- Set **`available: false`** to show a "coming soon" card without making it
  selectable (see `placeholders.ts` for minimal examples).

## 2. Register it

In `src/constants/certifications/index.ts`:

```ts
import { az104 } from "./az-104";

export const CERTIFICATIONS: CertificationConfig[] = [
  awsSaaC03,
  az104,        // ← add here
  // …
];
```

The registry exposes `getCertification(id)`, `getCertificationOrThrow(id)`,
`getAvailableCertifications()`, and `DEFAULT_CERTIFICATION_ID`. Nothing else needs
to change.

## 3. (Optional) verify

- The landing page and the Generate picker will list the new cert automatically.
- Generate a roadmap and a few questions to sanity-check that your `domainId`s
  flow through to analytics (mastery bars are keyed by domain).
- Add a unit test mirroring `tests/unit/analytics.test.ts` if the cert has
  unusual scoring (e.g. performance-based exams with `questionCount: 0`).

## Provider enum

If you introduce a brand-new vendor, extend `CertificationProvider` in
`src/types/certification.ts`. The existing set covers AWS, Azure, GCP,
Kubernetes, HashiCorp, Red Hat and CompTIA.
