import type { CertificationConfig } from "@/types";

/**
 * AWS Certified Solutions Architect – Associate (SAA-C03)
 *
 * Domain weightings and exam metadata reflect the official SAA-C03 exam guide.
 */
export const awsSaaC03: CertificationConfig = {
  id: "aws-saa-c03",
  provider: "aws",
  code: "SAA-C03",
  name: "AWS Solutions Architect Associate",
  tagline: "Design resilient, cost-optimized architectures on AWS.",
  description:
    "Validates the ability to design and deploy well-architected solutions on AWS that are secure, resilient, high-performing, and cost-optimized.",
  level: "associate",
  color: "#FF9900",
  recommendedHours: 120,
  tags: ["aws", "cloud", "architecture", "associate", "popular"],
  available: true,
  exam: {
    questionCount: 65,
    durationMinutes: 130,
    passingScore: 720,
    maxScore: 1000,
    priceUsd: 150,
    formats: ["mcq", "multi-select", "scenario"],
    validityYears: 3,
  },
  domains: [
    {
      id: "design-secure",
      name: "Design Secure Architectures",
      weightage: 30,
      recommendedHours: 36,
      topics: [
        { id: "iam", name: "IAM users, roles, policies", weight: 5 },
        { id: "iam-federation", name: "Identity federation & SSO", weight: 3 },
        { id: "kms", name: "KMS, encryption at rest/in transit", weight: 4 },
        { id: "secrets", name: "Secrets Manager & Parameter Store", weight: 2 },
        { id: "security-groups", name: "Security groups & NACLs", weight: 4 },
        { id: "waf-shield", name: "WAF, Shield, GuardDuty", weight: 3 },
        { id: "vpc-security", name: "VPC isolation & endpoints", weight: 4 },
      ],
    },
    {
      id: "design-resilient",
      name: "Design Resilient Architectures",
      weightage: 26,
      recommendedHours: 31,
      topics: [
        { id: "multi-az", name: "Multi-AZ & multi-region design", weight: 5 },
        { id: "elb", name: "Elastic Load Balancing", weight: 4 },
        { id: "asg", name: "Auto Scaling Groups", weight: 4 },
        { id: "decoupling", name: "Decoupling with SQS/SNS", weight: 4 },
        { id: "rds-ha", name: "RDS Multi-AZ & read replicas", weight: 3 },
        { id: "route53", name: "Route 53 routing & failover", weight: 3 },
        { id: "backup-dr", name: "Backup & disaster recovery", weight: 3 },
      ],
    },
    {
      id: "design-performant",
      name: "Design High-Performing Architectures",
      weightage: 24,
      recommendedHours: 29,
      topics: [
        { id: "compute-select", name: "Selecting compute (EC2/Lambda/Fargate)", weight: 4 },
        { id: "storage-select", name: "S3, EBS, EFS, FSx selection", weight: 4 },
        { id: "caching", name: "ElastiCache & CloudFront", weight: 4 },
        { id: "databases", name: "RDS, Aurora, DynamoDB selection", weight: 4 },
        { id: "networking-perf", name: "Global Accelerator & Direct Connect", weight: 3 },
        { id: "data-ingestion", name: "Kinesis & data streaming", weight: 3 },
      ],
    },
    {
      id: "design-cost",
      name: "Design Cost-Optimized Architectures",
      weightage: 20,
      recommendedHours: 24,
      topics: [
        { id: "ec2-pricing", name: "EC2 pricing models (Spot/RI/Savings)", weight: 4 },
        { id: "s3-storage-classes", name: "S3 storage classes & lifecycle", weight: 4 },
        { id: "cost-tools", name: "Cost Explorer, Budgets, Trusted Advisor", weight: 3 },
        { id: "data-transfer", name: "Minimizing data transfer costs", weight: 3 },
        { id: "right-sizing", name: "Right-sizing compute & storage", weight: 3 },
      ],
    },
  ],
};
