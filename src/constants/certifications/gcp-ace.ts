import type { CertificationConfig } from "@/types";

/**
 * Google Cloud Associate Cloud Engineer (ACE)
 *
 * Domain weightings reflect the official Google Cloud "Associate Cloud Engineer
 * Certification Exam Guide" (current 2025/2026 version), whose five sections are:
 *   1. Setting up a cloud solution environment             (~20%)
 *   2. Planning and configuring a cloud solution           (~17.5%)
 *   3. Deploying and implementing a cloud solution         (~25%)
 *   4. Ensuring successful operation of a cloud solution   (~20%)
 *   5. Configuring access and security                     (~17.5%)
 * Source: https://cloud.google.com/learn/certification/guides/cloud-engineer/
 *
 * Exam metadata: ~120 min, 50-60 multiple choice / multiple select questions,
 * USD $125, valid 3 years. Google does not publish a numeric passing score, so a
 * normalized 70/100 convention is used here.
 */
export const gcpAce: CertificationConfig = {
  id: "gcp-ace",
  provider: "gcp",
  code: "ACE",
  name: "Google Associate Cloud Engineer",
  tagline: "Deploy, monitor, and operate solutions on Google Cloud.",
  description:
    "Validates the ability to deploy and secure applications and infrastructure, monitor operations across multiple projects, and maintain enterprise solutions on Google Cloud using the Console and gcloud CLI.",
  level: "associate",
  color: "#4285F4",
  recommendedHours: 100,
  tags: ["gcp", "cloud", "associate"],
  available: true,
  exam: {
    questionCount: 50,
    durationMinutes: 120,
    passingScore: 70,
    maxScore: 100,
    priceUsd: 125,
    formats: ["mcq", "multi-select"],
    validityYears: 3,
  },
  domains: [
    {
      id: "setting-up-environment",
      name: "Setting up a cloud solution environment",
      weightage: 20,
      recommendedHours: 20,
      topics: [
        { id: "projects-billing", name: "Setting up cloud projects and billing accounts", weight: 4 },
        { id: "resource-hierarchy", name: "Resource hierarchy: organizations, folders, projects", weight: 3 },
        { id: "iam-setup", name: "Configuring initial IAM roles and members", weight: 4 },
        { id: "apis-quotas", name: "Enabling APIs, services, and managing quotas", weight: 3 },
        { id: "cli-sdk", name: "Installing and configuring the gcloud CLI and Cloud SDK", weight: 4 },
        { id: "cloud-shell", name: "Using Cloud Shell and Cloud Console", weight: 2 },
      ],
    },
    {
      id: "planning-configuring",
      name: "Planning and configuring a cloud solution",
      weightage: 17.5,
      recommendedHours: 17,
      topics: [
        { id: "compute-selection", name: "Choosing compute: Compute Engine, GKE, Cloud Run, App Engine, Functions", weight: 5 },
        { id: "storage-selection", name: "Selecting storage: Cloud Storage classes, persistent disks, Filestore", weight: 4 },
        { id: "database-selection", name: "Selecting databases: Cloud SQL, Spanner, Bigtable, Firestore", weight: 4 },
        { id: "network-planning", name: "Planning VPC networks, subnets, and IP addressing", weight: 4 },
        { id: "pricing-calculator", name: "Estimating costs with the Pricing Calculator", weight: 2 },
      ],
    },
    {
      id: "deploying-implementing",
      name: "Deploying and implementing a cloud solution",
      weightage: 25,
      recommendedHours: 25,
      topics: [
        { id: "deploy-compute-engine", name: "Deploying Compute Engine VMs, instance groups, and templates", weight: 5 },
        { id: "deploy-gke", name: "Deploying and managing GKE clusters and workloads", weight: 5 },
        { id: "deploy-serverless", name: "Deploying App Engine, Cloud Run, and Cloud Functions", weight: 4 },
        { id: "deploy-storage", name: "Creating Cloud Storage buckets and configuring access", weight: 3 },
        { id: "deploy-networking", name: "Configuring VPCs, firewall rules, Cloud NAT, and load balancers", weight: 4 },
        { id: "deploy-data-iac", name: "Deploying data solutions and using infrastructure as code", weight: 4 },
      ],
    },
    {
      id: "ensuring-operation",
      name: "Ensuring successful operation of a cloud solution",
      weightage: 20,
      recommendedHours: 20,
      topics: [
        { id: "manage-compute", name: "Managing Compute Engine and GKE resources", weight: 4 },
        { id: "manage-storage-db", name: "Managing storage and database resources", weight: 3 },
        { id: "monitoring", name: "Configuring Cloud Monitoring metrics, dashboards, and alerts", weight: 4 },
        { id: "logging", name: "Working with Cloud Logging and log sinks", weight: 3 },
        { id: "error-debug-trace", name: "Using Error Reporting, Debugger, and Cloud Trace", weight: 3 },
        { id: "billing-management", name: "Managing billing, budgets, and quotas in operation", weight: 3 },
      ],
    },
    {
      id: "access-security",
      name: "Configuring access and security",
      weightage: 17.5,
      recommendedHours: 18,
      topics: [
        { id: "iam-roles", name: "Managing IAM roles: primitive, predefined, and custom", weight: 5 },
        { id: "service-accounts", name: "Creating and managing service accounts and keys", weight: 4 },
        { id: "org-policies", name: "Applying organization policies and resource constraints", weight: 3 },
        { id: "audit-logging", name: "Viewing audit logs for projects and resources", weight: 3 },
        { id: "network-security", name: "Configuring network security and VPC Service Controls", weight: 3 },
      ],
    },
  ],
};
