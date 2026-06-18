import type { CertificationConfig } from "@/types";

export const azureAz104: CertificationConfig = {
  id: "az-104",
  provider: "azure",
  code: "AZ-104",
  name: "Azure Administrator Associate",
  tagline:
    "Master the day-to-day administration of Microsoft Azure across identity, storage, compute, networking, and monitoring.",
  description:
    "Validates the skills to implement, manage, and monitor an organization's Microsoft Azure environment. Covers identity and governance, storage, compute resources, virtual networking, and ongoing monitoring and maintenance.",
  level: "associate",
  color: "#0078D4",
  recommendedHours: 110,
  domains: [
    {
      id: "identity-governance",
      name: "Manage Azure identities and governance",
      weightage: 24,
      recommendedHours: 26,
      topics: [
        {
          id: "entra-users-groups",
          name: "Manage Microsoft Entra users and groups",
          description:
            "Create and manage users and groups, group properties, licenses, and external users.",
          weight: 5,
        },
        {
          id: "self-service-password-reset",
          name: "Configure self-service password reset (SSPR)",
        },
        {
          id: "rbac-access",
          name: "Manage access to Azure resources",
          description:
            "Manage built-in Azure roles, assign roles at different scopes, and interpret access assignments.",
          weight: 5,
        },
        {
          id: "azure-policy",
          name: "Implement and manage Azure Policy",
        },
        {
          id: "subscriptions-management-groups",
          name: "Manage subscriptions and management groups",
          description:
            "Manage subscriptions, resource groups, and configure management groups.",
        },
        {
          id: "governance-tags-locks-costs",
          name: "Apply tags, resource locks, and cost management",
          description:
            "Apply and manage tags and resource locks, and manage costs with alerts, budgets, and Azure Advisor.",
          weight: 4,
        },
      ],
    },
    {
      id: "storage",
      name: "Implement and manage storage",
      weightage: 18,
      recommendedHours: 20,
      topics: [
        {
          id: "configure-storage-access",
          name: "Configure access to storage",
          description:
            "Configure storage firewalls, SAS tokens, stored access policies, access keys, and identity-based access for Azure Files.",
          weight: 4,
        },
        {
          id: "storage-accounts",
          name: "Configure and manage storage accounts",
          description:
            "Create and configure storage accounts, redundancy, object replication, and encryption.",
          weight: 5,
        },
        {
          id: "azure-files",
          name: "Configure Azure Files",
          description:
            "Create and configure file shares, snapshots, and soft delete for Azure Files.",
        },
        {
          id: "blob-storage",
          name: "Configure Azure Blob Storage",
          description:
            "Configure containers, storage tiers, soft delete, lifecycle management, and blob versioning.",
          weight: 4,
        },
        {
          id: "storage-data-tools",
          name: "Manage data with Storage Explorer and AzCopy",
        },
      ],
    },
    {
      id: "compute",
      name: "Deploy and manage Azure compute resources",
      weightage: 24,
      recommendedHours: 26,
      topics: [
        {
          id: "arm-bicep-templates",
          name: "Automate deployment with ARM templates or Bicep",
          description:
            "Interpret, modify, and deploy resources using Azure Resource Manager templates or Bicep files.",
          weight: 4,
        },
        {
          id: "virtual-machines",
          name: "Create and configure virtual machines",
          description:
            "Create VMs, manage sizes and disks, configure encryption at host, and deploy to availability zones and sets.",
          weight: 5,
        },
        {
          id: "vm-scale-sets",
          name: "Deploy and configure Virtual Machine Scale Sets",
        },
        {
          id: "containers",
          name: "Provision and manage containers",
          description:
            "Manage Azure Container Registry, Azure Container Instances, and Azure Container Apps, including sizing and scaling.",
          weight: 4,
        },
        {
          id: "app-service",
          name: "Create and configure Azure App Service",
          description:
            "Provision App Service plans, configure scaling, TLS, custom domains, backup, networking, and deployment slots.",
          weight: 4,
        },
      ],
    },
    {
      id: "networking",
      name: "Implement and manage virtual networking",
      weightage: 18,
      recommendedHours: 20,
      topics: [
        {
          id: "virtual-networks",
          name: "Configure and manage virtual networks",
          description:
            "Create and configure virtual networks, subnets, peering, public IPs, and user-defined routes.",
          weight: 5,
        },
        {
          id: "secure-network-access",
          name: "Configure secure access to virtual networks",
          description:
            "Configure NSGs and application security groups, Azure Bastion, and service and private endpoints.",
          weight: 4,
        },
        {
          id: "azure-dns",
          name: "Configure name resolution with Azure DNS",
        },
        {
          id: "load-balancing",
          name: "Configure and troubleshoot load balancing",
          description: "Configure internal or public load balancers and troubleshoot load balancing.",
          weight: 4,
        },
        {
          id: "network-troubleshooting",
          name: "Troubleshoot network connectivity",
        },
      ],
    },
    {
      id: "monitor-maintain",
      name: "Monitor and maintain Azure resources",
      weightage: 16,
      recommendedHours: 18,
      topics: [
        {
          id: "azure-monitor",
          name: "Monitor resources with Azure Monitor",
          description:
            "Interpret metrics, configure log settings, query logs, and set up alert rules and action groups.",
          weight: 5,
        },
        {
          id: "monitor-insights",
          name: "Configure Azure Monitor Insights",
          description:
            "Monitor virtual machines, storage accounts, and networks using Azure Monitor Insights.",
        },
        {
          id: "network-watcher",
          name: "Use Network Watcher and Connection Monitor",
        },
        {
          id: "azure-backup",
          name: "Implement backup and recovery",
          description:
            "Create Recovery Services and Backup vaults, configure backup policies, and perform backup and restore.",
          weight: 4,
        },
        {
          id: "site-recovery",
          name: "Configure Azure Site Recovery",
          description:
            "Configure Site Recovery for Azure resources and perform failover to a secondary region.",
          weight: 4,
        },
      ],
    },
  ],
  exam: {
    questionCount: 50,
    durationMinutes: 120,
    passingScore: 700,
    maxScore: 1000,
    priceUsd: 165,
    formats: ["mcq", "multi-select", "scenario"],
    validityYears: 1,
  },
  tags: ["azure", "cloud", "associate", "administrator"],
  available: true,
};
