import type { CertificationConfig } from "@/types";

/**
 * Certified Kubernetes Administrator (CKA)
 *
 * Domain weightings and exam metadata reflect the current official CNCF /
 * Linux Foundation CKA curriculum:
 *   - Cluster Architecture, Installation & Configuration — 25%
 *   - Workloads & Scheduling                             — 15%
 *   - Services & Networking                              — 20%
 *   - Storage                                            — 10%
 *   - Troubleshooting                                    — 30%
 *
 * The CKA is a performance-based exam: candidates solve ~15-20 hands-on tasks
 * from a live command line. It is graded on a 0-100 scale with a 66% pass mark.
 * Certifications earned on or after 2024-04-01 are valid for 2 years.
 */
export const cka: CertificationConfig = {
  id: "cka",
  provider: "kubernetes",
  code: "CKA",
  name: "Certified Kubernetes Administrator",
  tagline:
    "Prove you can install, configure, and operate production Kubernetes clusters entirely from the command line.",
  description:
    "Validates the skills, knowledge, and competency to perform the responsibilities of a Kubernetes administrator. The exam is fully hands-on: candidates provision, manage, and troubleshoot real clusters under time pressure rather than answering multiple-choice questions.",
  level: "associate",
  color: "#326CE5",
  recommendedHours: 90,
  tags: ["kubernetes", "devops", "hands-on", "cncf"],
  available: true,
  exam: {
    questionCount: 0,
    durationMinutes: 120,
    passingScore: 66,
    maxScore: 100,
    priceUsd: 445,
    formats: ["scenario"],
    validityYears: 2,
  },
  domains: [
    {
      id: "cluster-architecture-installation-configuration",
      name: "Cluster Architecture, Installation & Configuration",
      weightage: 25,
      recommendedHours: 23,
      topics: [
        {
          id: "rbac",
          name: "Manage role-based access control (RBAC)",
          description: "Roles, ClusterRoles, bindings, and service accounts.",
          weight: 4,
        },
        {
          id: "kubeadm-cluster",
          name: "Provision clusters with kubeadm",
          description: "Bootstrap, join nodes, and upgrade clusters using kubeadm.",
          weight: 5,
        },
        {
          id: "ha-control-plane",
          name: "Manage a highly-available control plane",
          description: "Stacked vs. external etcd and multi-master topologies.",
          weight: 4,
        },
        {
          id: "lifecycle-upgrades",
          name: "Cluster lifecycle and version upgrades",
          description: "Perform version upgrades across control plane and nodes.",
          weight: 4,
        },
        {
          id: "extension-interfaces",
          name: "Understand extension interfaces (CNI, CSI, CRI)",
          description: "Container networking, storage, and runtime interfaces.",
          weight: 3,
        },
        {
          id: "crds-operators",
          name: "Custom Resource Definitions (CRDs) and Operators",
          description: "Install and configure CRDs and operators via Helm and Kustomize.",
          weight: 3,
        },
      ],
    },
    {
      id: "workloads-scheduling",
      name: "Workloads & Scheduling",
      weightage: 15,
      recommendedHours: 14,
      topics: [
        {
          id: "deployments-rollouts",
          name: "Deployments and rolling updates/rollbacks",
          description: "Manage application lifecycle with Deployments.",
          weight: 4,
        },
        {
          id: "configmaps-secrets",
          name: "ConfigMaps and Secrets",
          description: "Configure applications using ConfigMaps and Secrets.",
          weight: 3,
        },
        {
          id: "resource-limits",
          name: "Resource requests, limits, and quotas",
          description: "Define and understand resource scheduling constraints.",
          weight: 3,
        },
        {
          id: "scheduling-admission",
          name: "Pod scheduling, affinity, and admission",
          description: "Node selectors, affinity/anti-affinity, taints, and tolerations.",
          weight: 3,
        },
        {
          id: "autoscaling",
          name: "Workload autoscaling",
          description: "Horizontal Pod Autoscaler and scaling applications.",
          weight: 2,
        },
      ],
    },
    {
      id: "services-networking",
      name: "Services & Networking",
      weightage: 20,
      recommendedHours: 18,
      topics: [
        {
          id: "pod-connectivity",
          name: "Pod-to-pod connectivity and the cluster network model",
          description: "Understand the Kubernetes networking model.",
          weight: 4,
        },
        {
          id: "services",
          name: "Services and service types",
          description: "ClusterIP, NodePort, and LoadBalancer Services.",
          weight: 4,
        },
        {
          id: "ingress",
          name: "Ingress controllers and Ingress resources",
          description: "Expose and route HTTP/S traffic via Ingress.",
          weight: 3,
        },
        {
          id: "gateway-api",
          name: "Gateway API",
          description: "Use the Gateway API for advanced traffic routing.",
          weight: 2,
        },
        {
          id: "coredns",
          name: "CoreDNS and service discovery",
          description: "Configure and troubleshoot in-cluster DNS.",
          weight: 3,
        },
        {
          id: "network-policies",
          name: "Network policies",
          description: "Restrict pod traffic with NetworkPolicy resources.",
          weight: 3,
        },
      ],
    },
    {
      id: "storage",
      name: "Storage",
      weightage: 10,
      recommendedHours: 9,
      topics: [
        {
          id: "storage-classes",
          name: "Storage classes and dynamic provisioning",
          description: "Implement StorageClasses and dynamic volume provisioning.",
          weight: 3,
        },
        {
          id: "persistent-volumes",
          name: "Persistent Volumes and Persistent Volume Claims",
          description: "Provision and bind PVs and PVCs.",
          weight: 3,
        },
        {
          id: "access-modes-reclaim",
          name: "Volume access modes and reclaim policies",
          description: "Configure access modes and reclaim behavior.",
          weight: 2,
        },
        {
          id: "volume-types",
          name: "Volume types and application configuration",
          description: "Mount and configure volumes for workloads.",
          weight: 2,
        },
      ],
    },
    {
      id: "troubleshooting",
      name: "Troubleshooting",
      weightage: 30,
      recommendedHours: 26,
      topics: [
        {
          id: "cluster-component-failures",
          name: "Troubleshoot cluster and node components",
          description: "Diagnose control plane, kubelet, and node failures.",
          weight: 5,
        },
        {
          id: "monitor-logs",
          name: "Monitor cluster and application resources",
          description: "Inspect events, logs, and resource metrics.",
          weight: 4,
        },
        {
          id: "application-failures",
          name: "Troubleshoot application failures",
          description: "Debug failing pods, containers, and workloads.",
          weight: 4,
        },
        {
          id: "networking-troubleshooting",
          name: "Troubleshoot services and networking",
          description: "Resolve Service, DNS, and connectivity problems.",
          weight: 4,
        },
        {
          id: "manage-container-output",
          name: "Manage and analyze container stdout/stderr logs",
          description: "Collect and interpret container output streams.",
          weight: 3,
        },
      ],
    },
  ],
};
