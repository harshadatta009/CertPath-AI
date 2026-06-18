import type { CertificationConfig } from "@/types";

export const ckad: CertificationConfig = {
  id: "ckad",
  provider: "kubernetes",
  code: "CKAD",
  name: "Certified Kubernetes Application Developer",
  tagline:
    "Prove you can design, build, configure, and expose cloud-native applications on Kubernetes.",
  description:
    "A hands-on, performance-based certification from the CNCF and the Linux Foundation that validates the ability to design, build, deploy, and operate containerized applications on Kubernetes. Candidates solve real tasks from the command line against live clusters, covering application design, deployment, observability, configuration, security, and networking.",
  level: "associate",
  color: "#326CE5",
  recommendedHours: 80,
  domains: [
    {
      id: "application-design-and-build",
      name: "Application Design and Build",
      weightage: 20,
      recommendedHours: 16,
      topics: [
        {
          id: "container-images",
          name: "Define, build and modify container images",
          description:
            "Author Dockerfiles, build and tag images, and understand image layering and registries.",
          weight: 4,
        },
        {
          id: "workload-resources",
          name: "Choose and use the right workload resource",
          description:
            "Select between Deployments, Jobs, CronJobs and other controllers for batch and long-running workloads.",
          weight: 4,
        },
        {
          id: "multi-container-pods",
          name: "Understand multi-container Pod design patterns",
          description:
            "Apply sidecar, init container, adapter and ambassador patterns within a single Pod.",
          weight: 5,
        },
        {
          id: "persistent-volumes",
          name: "Utilize persistent and ephemeral volumes",
          description:
            "Mount emptyDir and other ephemeral volumes, and consume PersistentVolumeClaims for durable storage.",
          weight: 4,
        },
      ],
    },
    {
      id: "application-deployment",
      name: "Application Deployment",
      weightage: 20,
      recommendedHours: 16,
      topics: [
        {
          id: "deployments-rolling-updates",
          name: "Use Deployments to perform rolling updates and rollbacks",
          description:
            "Manage Deployment rollouts, control rolling update strategy, pause/resume, and roll back to prior revisions.",
          weight: 5,
        },
        {
          id: "deployment-strategies",
          name: "Understand deployment strategies (blue/green, canary)",
          description:
            "Implement blue/green and canary release approaches using Kubernetes primitives.",
          weight: 4,
        },
        {
          id: "helm-package-manager",
          name: "Use the Helm package manager to deploy applications",
          description:
            "Install, upgrade and roll back applications packaged as Helm charts.",
          weight: 3,
        },
        {
          id: "kustomize",
          name: "Use Kustomize to manage configuration",
          description:
            "Apply overlays and patches with Kustomize to deploy environment-specific manifests.",
          weight: 3,
        },
      ],
    },
    {
      id: "application-observability-and-maintenance",
      name: "Application Observability and Maintenance",
      weightage: 15,
      recommendedHours: 12,
      topics: [
        {
          id: "probes-health-checks",
          name: "Implement probes and health checks",
          description:
            "Configure liveness, readiness and startup probes to manage Pod health and traffic.",
          weight: 5,
        },
        {
          id: "monitoring-built-in",
          name: "Use built-in CLI tools to monitor applications",
          description:
            "Use kubectl top and related commands to observe resource usage and application status.",
          weight: 3,
        },
        {
          id: "container-logs",
          name: "Utilize container logs",
          description:
            "Access and follow container and Pod logs to inspect runtime behavior.",
          weight: 4,
        },
        {
          id: "debugging",
          name: "Debug applications in Kubernetes",
          description:
            "Diagnose failing Pods using describe, events, exec and ephemeral debug containers.",
          weight: 5,
        },
        {
          id: "api-deprecations",
          name: "Understand API deprecations",
          description:
            "Recognize deprecated API versions and migrate manifests to current group/versions.",
          weight: 2,
        },
      ],
    },
    {
      id: "application-environment-configuration-and-security",
      name: "Application Environment, Configuration and Security",
      weightage: 25,
      recommendedHours: 20,
      topics: [
        {
          id: "crds-operators",
          name: "Discover and use CRDs and Operators",
          description:
            "Inspect Custom Resource Definitions and extend the cluster with operator-managed resources.",
          weight: 3,
        },
        {
          id: "authentication-authorization-admission",
          name: "Understand authentication, authorization and admission control",
          description:
            "Reason about how requests are authenticated, authorized via RBAC, and validated by admission controllers.",
          weight: 4,
        },
        {
          id: "configmaps-secrets",
          name: "Define and consume ConfigMaps and Secrets",
          description:
            "Inject configuration and sensitive data into Pods via environment variables and mounted volumes.",
          weight: 5,
        },
        {
          id: "resource-requirements-limits-quotas",
          name: "Understand requests, limits and ResourceQuotas",
          description:
            "Set Pod resource requests and limits and manage namespace-level ResourceQuotas and LimitRanges.",
          weight: 4,
        },
        {
          id: "service-accounts",
          name: "Create and consume ServiceAccounts",
          description:
            "Provision ServiceAccounts and bind them to Pods for in-cluster API authentication.",
          weight: 3,
        },
        {
          id: "security-contexts",
          name: "Understand application security (SecurityContexts, capabilities)",
          description:
            "Apply SecurityContexts, run as non-root, drop Linux capabilities and constrain Pod privileges.",
          weight: 4,
        },
      ],
    },
    {
      id: "services-and-networking",
      name: "Services and Networking",
      weightage: 20,
      recommendedHours: 16,
      topics: [
        {
          id: "network-policies",
          name: "Demonstrate a basic understanding of NetworkPolicies",
          description:
            "Restrict Pod-to-Pod and ingress/egress traffic using NetworkPolicy rules and selectors.",
          weight: 4,
        },
        {
          id: "services",
          name: "Provide and troubleshoot access to applications via Services",
          description:
            "Expose Pods with ClusterIP, NodePort and LoadBalancer Services and debug Service connectivity.",
          weight: 5,
        },
        {
          id: "ingress",
          name: "Use Ingress rules to expose applications",
          description:
            "Route external HTTP/HTTPS traffic to Services through Ingress resources and controllers.",
          weight: 4,
        },
        {
          id: "service-discovery-dns",
          name: "Use cluster DNS for service discovery",
          description:
            "Resolve Services and Pods through cluster DNS to enable in-cluster communication.",
          weight: 4,
        },
      ],
    },
  ],
  exam: {
    questionCount: 0,
    durationMinutes: 120,
    passingScore: 66,
    maxScore: 100,
    priceUsd: 445,
    formats: ["scenario"],
    validityYears: 2,
  },
  tags: ["kubernetes", "developer", "hands-on", "cncf"],
  available: true,
};
