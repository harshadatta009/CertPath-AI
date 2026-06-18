import type { CertificationConfig } from "@/types";

/**
 * CompTIA Security+ (SY0-701)
 *
 * Domain weightings and exam metadata reflect the official SY0-701 exam
 * objectives. The five domains sum to 100%:
 *   General Security Concepts                    12%
 *   Threats, Vulnerabilities, and Mitigations    22%
 *   Security Architecture                        18%
 *   Security Operations                          28%
 *   Security Program Management and Oversight    20%
 */
export const comptiaSecurityPlus: CertificationConfig = {
  id: "comptia-security-plus",
  provider: "comptia",
  code: "SY0-701",
  name: "CompTIA Security+",
  tagline:
    "Validate the core skills required to perform essential cybersecurity functions and launch a security career.",
  description:
    "A globally recognized, vendor-neutral certification that proves baseline cybersecurity skills across threats, architecture, operations, and governance. It covers risk assessment, incident response, hybrid and cloud security, and the security controls used to protect modern enterprise environments.",
  level: "foundational",
  color: "#C8102E",
  recommendedHours: 90,
  tags: ["comptia", "security", "cybersecurity", "foundational"],
  available: true,
  exam: {
    questionCount: 90,
    durationMinutes: 90,
    passingScore: 750,
    maxScore: 900,
    priceUsd: 404,
    formats: ["mcq", "multi-select", "scenario"],
    validityYears: 3,
  },
  domains: [
    {
      id: "general-security-concepts",
      name: "General Security Concepts",
      weightage: 12,
      recommendedHours: 11,
      topics: [
        { id: "security-controls", name: "Security control categories & types", weight: 4 },
        { id: "fundamental-concepts", name: "CIA triad, AAA, zero trust & gap analysis", weight: 5 },
        { id: "change-management", name: "Change management processes & impact", weight: 3 },
        { id: "cryptographic-solutions", name: "Cryptography, PKI, hashing & certificates", weight: 5 },
      ],
    },
    {
      id: "threats-vulnerabilities-mitigations",
      name: "Threats, Vulnerabilities, and Mitigations",
      weightage: 22,
      recommendedHours: 20,
      topics: [
        { id: "threat-actors", name: "Threat actors & motivations", weight: 4 },
        { id: "attack-vectors", name: "Threat vectors & attack surfaces", weight: 4 },
        { id: "vulnerability-types", name: "Application, OS, hardware & cloud vulnerabilities", weight: 5 },
        { id: "malicious-activity", name: "Malware & indicators of malicious activity", weight: 5 },
        { id: "mitigation-techniques", name: "Mitigation techniques to secure the enterprise", weight: 4 },
      ],
    },
    {
      id: "security-architecture",
      name: "Security Architecture",
      weightage: 18,
      recommendedHours: 16,
      topics: [
        { id: "architecture-models", name: "Cloud, IaC, virtualization & on-prem models", weight: 4 },
        { id: "secure-infrastructure", name: "Secure enterprise infrastructure design", weight: 5 },
        { id: "data-protection", name: "Data classification & protection strategies", weight: 4 },
        { id: "resilience-recovery", name: "Resilience & recovery in security architecture", weight: 5 },
      ],
    },
    {
      id: "security-operations",
      name: "Security Operations",
      weightage: 28,
      recommendedHours: 25,
      topics: [
        { id: "secure-baselines", name: "Secure baselines & hardening techniques", weight: 4 },
        { id: "asset-management", name: "Asset & vulnerability management", weight: 4 },
        { id: "security-monitoring", name: "Alerting, monitoring & SIEM tooling", weight: 5 },
        { id: "identity-access", name: "Identity & access management", weight: 5 },
        { id: "automation-orchestration", name: "Automation & orchestration (SOAR)", weight: 4 },
        { id: "incident-response", name: "Incident response & digital forensics", weight: 6 },
      ],
    },
    {
      id: "security-program-management-oversight",
      name: "Security Program Management and Oversight",
      weightage: 20,
      recommendedHours: 18,
      topics: [
        { id: "governance", name: "Security governance, policies & standards", weight: 4 },
        { id: "risk-management", name: "Risk management & assessment processes", weight: 5 },
        { id: "third-party-risk", name: "Third-party & vendor risk management", weight: 3 },
        { id: "compliance", name: "Compliance, audits & assessments", weight: 4 },
        { id: "security-awareness", name: "Security awareness training & practices", weight: 4 },
      ],
    },
  ],
};
