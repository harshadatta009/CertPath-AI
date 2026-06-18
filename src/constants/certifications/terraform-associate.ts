import type { CertificationConfig } from "@/types";

/**
 * HashiCorp Certified: Terraform Associate (003)
 *
 * Domains map 1:1 to the nine official 003 exam objectives from the HashiCorp
 * Exam Content List / Learning Path. HashiCorp does NOT publish per-objective
 * weightage percentages, so the `weightage` values below are a reasonable
 * distribution that sums to 100 — weighted toward the CLI/core workflow, state,
 * and configuration objectives that dominate the real exam.
 */
export const terraformAssociate: CertificationConfig = {
  id: "terraform-associate-003",
  provider: "hashicorp",
  code: "TF-003",
  name: "HashiCorp Terraform Associate",
  tagline:
    "Provision and manage infrastructure as code with Terraform's declarative core workflow.",
  description:
    "Validates foundational Infrastructure as Code skills with Terraform: the init/plan/apply/destroy workflow, providers, modules, remote state, and HCP Terraform. Intended for cloud engineers and operators who use Terraform in production.",
  level: "associate",
  color: "#7B42BC",
  recommendedHours: 60,
  tags: ["hashicorp", "terraform", "iac", "devops", "associate"],
  available: true,
  exam: {
    questionCount: 57,
    durationMinutes: 60,
    passingScore: 70,
    maxScore: 100,
    priceUsd: 70.5,
    formats: ["mcq", "multi-select"],
    validityYears: 2,
  },
  domains: [
    {
      id: "understand-iac-concepts",
      name: "Understand Infrastructure as Code (IaC) concepts",
      weightage: 8,
      recommendedHours: 4,
      topics: [
        {
          id: "iac-definition",
          name: "What Infrastructure as Code is and the problems it solves",
          weight: 3,
        },
        {
          id: "iac-advantages",
          name: "Advantages of IaC patterns (repeatability, versioning, automation)",
          weight: 3,
        },
        {
          id: "declarative-vs-imperative",
          name: "Declarative vs. imperative provisioning",
          weight: 2,
        },
      ],
    },
    {
      id: "understand-terraform-purpose",
      name: "Understand the purpose of Terraform (vs other IaC)",
      weightage: 8,
      recommendedHours: 4,
      topics: [
        {
          id: "multi-cloud-provisioning",
          name: "Multi-cloud and provider-agnostic provisioning benefits",
          weight: 3,
        },
        {
          id: "provisioning-vs-config-mgmt",
          name: "Terraform vs configuration management tools (Ansible, Chef, Puppet)",
          weight: 2,
        },
        {
          id: "terraform-state-purpose",
          name: "Why Terraform uses state to map config to real resources",
          weight: 3,
        },
      ],
    },
    {
      id: "understand-terraform-basics",
      name: "Understand Terraform basics",
      weightage: 12,
      recommendedHours: 7,
      topics: [
        {
          id: "install-verify",
          name: "Install and version Terraform",
          weight: 2,
        },
        {
          id: "providers-plugins",
          name: "Providers, plugins, and the registry",
          weight: 4,
        },
        {
          id: "provider-installation",
          name: "How Terraform finds and fetches providers during init",
          weight: 3,
        },
        {
          id: "provider-version-constraints",
          name: "Provider and Terraform version constraints",
          weight: 3,
        },
      ],
    },
    {
      id: "use-terraform-cli",
      name: "Use Terraform outside of the core workflow (CLI)",
      weightage: 14,
      recommendedHours: 9,
      topics: [
        {
          id: "fmt-validate",
          name: "terraform fmt and terraform validate",
          weight: 3,
        },
        {
          id: "taint-replace",
          name: "Forcing recreation with -replace (and legacy taint)",
          weight: 2,
        },
        {
          id: "import-resources",
          name: "Importing existing infrastructure with terraform import",
          weight: 4,
        },
        {
          id: "state-cli",
          name: "Inspecting and manipulating state via the CLI (state list/show/mv/rm)",
          weight: 4,
        },
        {
          id: "verbose-logging",
          name: "Enabling verbose logging with TF_LOG",
          weight: 1,
        },
      ],
    },
    {
      id: "interact-with-modules",
      name: "Interact with Terraform modules",
      weightage: 11,
      recommendedHours: 7,
      topics: [
        {
          id: "module-sources",
          name: "Module sources (local, registry, Git)",
          weight: 3,
        },
        {
          id: "module-inputs-outputs",
          name: "Passing inputs and consuming outputs",
          weight: 4,
        },
        {
          id: "module-versioning",
          name: "Pinning module versions",
          weight: 2,
        },
        {
          id: "module-scope-refactor",
          name: "Module scope, structure, and refactoring",
          weight: 2,
        },
      ],
    },
    {
      id: "use-core-workflow",
      name: "Use the core Terraform workflow",
      weightage: 16,
      recommendedHours: 10,
      topics: [
        {
          id: "init",
          name: "terraform init and backend/provider initialization",
          weight: 4,
        },
        {
          id: "plan",
          name: "terraform plan and reading the execution plan",
          weight: 4,
        },
        {
          id: "apply",
          name: "terraform apply and approval flow",
          weight: 4,
        },
        {
          id: "destroy",
          name: "terraform destroy and resource teardown",
          weight: 2,
        },
        {
          id: "write-init-plan-apply-cycle",
          name: "Run a full write → init → plan → apply iteration",
          weight: 2,
        },
      ],
    },
    {
      id: "implement-maintain-state",
      name: "Implement and maintain state",
      weightage: 13,
      recommendedHours: 8,
      topics: [
        {
          id: "local-vs-remote-state",
          name: "Local state vs remote backends (S3, GCS, Azure Blob, HCP Terraform)",
          weight: 4,
        },
        {
          id: "state-locking",
          name: "State locking and why it matters",
          weight: 3,
        },
        {
          id: "backend-config",
          name: "Configuring and migrating backends",
          weight: 3,
        },
        {
          id: "sensitive-data-in-state",
          name: "Handling secrets and sensitive data stored in state",
          weight: 2,
        },
        {
          id: "workspaces",
          name: "Using workspaces to separate state",
          weight: 1,
        },
      ],
    },
    {
      id: "read-generate-modify-config",
      name: "Read, generate, and modify configuration",
      weightage: 13,
      recommendedHours: 8,
      topics: [
        {
          id: "variables-outputs",
          name: "Input variables, output values, and locals",
          weight: 4,
        },
        {
          id: "resource-data-references",
          name: "Referencing resource attributes and data sources",
          weight: 3,
        },
        {
          id: "built-in-functions",
          name: "Built-in functions and expressions",
          weight: 2,
        },
        {
          id: "dependencies",
          name: "Implicit and explicit (depends_on) dependencies",
          weight: 2,
        },
        {
          id: "meta-arguments",
          name: "Meta-arguments: count, for_each, and dynamic blocks",
          weight: 2,
        },
      ],
    },
    {
      id: "understand-hcp-terraform",
      name: "Understand HCP Terraform capabilities",
      weightage: 5,
      recommendedHours: 3,
      topics: [
        {
          id: "remote-execution",
          name: "Remote execution and remote state in HCP Terraform",
          weight: 2,
        },
        {
          id: "vcs-cli-workflows",
          name: "VCS-driven and CLI-driven workflows",
          weight: 1,
        },
        {
          id: "private-registry",
          name: "Private module registry",
          weight: 1,
        },
        {
          id: "governance-sentinel",
          name: "Collaboration and governance (teams, Sentinel policies)",
          weight: 1,
        },
      ],
    },
  ],
};
