import type { CertificationConfig } from "@/types";

/**
 * Lightweight "coming soon" certification entries. They render on the landing
 * page and certification picker but are not yet selectable. Promote one by
 * filling out its domains/topics in a dedicated config file and setting
 * `available: true` — no engine changes required.
 */
function comingSoon(
  partial: Omit<CertificationConfig, "domains" | "available">,
): CertificationConfig {
  return { ...partial, domains: [], available: false };
}

export const azureAz104 = comingSoon({
  id: "az-104",
  provider: "azure",
  code: "AZ-104",
  name: "Azure Administrator Associate",
  tagline: "Manage Azure identities, storage, compute and networking.",
  description: "Validates skills to implement, manage and monitor Azure environments.",
  level: "associate",
  color: "#0078D4",
  recommendedHours: 110,
  tags: ["azure", "cloud", "associate"],
  exam: { questionCount: 50, durationMinutes: 120, passingScore: 700, maxScore: 1000, priceUsd: 165, formats: ["mcq", "multi-select", "scenario"], validityYears: 1 },
});

export const gcpAce = comingSoon({
  id: "gcp-ace",
  provider: "gcp",
  code: "ACE",
  name: "Google Associate Cloud Engineer",
  tagline: "Deploy and operate solutions on Google Cloud.",
  description: "Validates the ability to deploy applications and monitor operations on GCP.",
  level: "associate",
  color: "#4285F4",
  recommendedHours: 100,
  tags: ["gcp", "cloud", "associate"],
  exam: { questionCount: 50, durationMinutes: 120, passingScore: 70, maxScore: 100, priceUsd: 125, formats: ["mcq", "multi-select"], validityYears: 3 },
});

export const cka = comingSoon({
  id: "cka",
  provider: "kubernetes",
  code: "CKA",
  name: "Certified Kubernetes Administrator",
  tagline: "Administer production Kubernetes clusters, hands-on.",
  description: "Performance-based exam validating Kubernetes cluster administration skills.",
  level: "associate",
  color: "#326CE5",
  recommendedHours: 90,
  tags: ["kubernetes", "devops", "hands-on"],
  exam: { questionCount: 17, durationMinutes: 120, passingScore: 66, maxScore: 100, priceUsd: 395, formats: ["scenario"], validityYears: 3 },
});

export const ckad = comingSoon({
  id: "ckad",
  provider: "kubernetes",
  code: "CKAD",
  name: "Certified Kubernetes Application Developer",
  tagline: "Design, build and deploy cloud-native apps on Kubernetes.",
  description: "Performance-based exam for designing and deploying applications on Kubernetes.",
  level: "associate",
  color: "#326CE5",
  recommendedHours: 80,
  tags: ["kubernetes", "developer", "hands-on"],
  exam: { questionCount: 19, durationMinutes: 120, passingScore: 66, maxScore: 100, priceUsd: 395, formats: ["scenario"], validityYears: 3 },
});

export const terraformAssociate = comingSoon({
  id: "terraform-associate-003",
  provider: "hashicorp",
  code: "TF-003",
  name: "HashiCorp Terraform Associate",
  tagline: "Master infrastructure as code with Terraform.",
  description: "Validates foundational Terraform knowledge and IaC workflows.",
  level: "associate",
  color: "#7B42BC",
  recommendedHours: 60,
  tags: ["hashicorp", "iac", "devops"],
  exam: { questionCount: 57, durationMinutes: 60, passingScore: 70, maxScore: 100, priceUsd: 70, formats: ["mcq", "multi-select"], validityYears: 2 },
});

export const rhcsa = comingSoon({
  id: "rhcsa-ex200",
  provider: "redhat",
  code: "EX200",
  name: "Red Hat Certified System Administrator",
  tagline: "Prove core Linux administration skills, hands-on.",
  description: "Performance-based exam covering essential RHEL system administration tasks.",
  level: "associate",
  color: "#EE0000",
  recommendedHours: 100,
  tags: ["redhat", "linux", "hands-on"],
  exam: { questionCount: 0, durationMinutes: 180, passingScore: 210, maxScore: 300, priceUsd: 500, formats: ["scenario"], validityYears: 3 },
});

export const comptiaSecurityPlus = comingSoon({
  id: "comptia-security-plus",
  provider: "comptia",
  code: "SY0-701",
  name: "CompTIA Security+",
  tagline: "Build a foundation in cybersecurity best practices.",
  description: "Validates baseline cybersecurity skills across threats, architecture and operations.",
  level: "foundational",
  color: "#C8102E",
  recommendedHours: 90,
  tags: ["comptia", "security", "foundational"],
  exam: { questionCount: 90, durationMinutes: 90, passingScore: 750, maxScore: 900, priceUsd: 392, formats: ["mcq", "multi-select", "scenario"], validityYears: 3 },
});
