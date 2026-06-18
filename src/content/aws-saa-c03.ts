import type { ContentPack } from "./types";

/**
 * Community-reviewed starter content for AWS SAA-C03.
 *
 * Every fact here should be backed by official AWS documentation. To add or
 * correct content, open a PR (see docs/CONTENT.md) and bump `version`.
 */
export const awsSaaC03Pack: ContentPack = {
  certificationId: "aws-saa-c03",
  version: 1,
  contributors: ["certpath-maintainers"],

  questions: [
    {
      type: "mcq",
      difficulty: "easy",
      domainId: "design-secure",
      topic: "IAM",
      question:
        "An application running on an EC2 instance needs to read objects from an S3 bucket. What is the AWS-recommended way to grant this access?",
      options: [
        "Store an IAM user's access keys in the application's config file",
        "Attach an IAM role with the required S3 permissions to the EC2 instance",
        "Make the S3 bucket public and filter by IP",
        "Embed the root account credentials in an environment variable",
      ],
      correctIndices: [1],
      explanation:
        "Attaching an IAM role to the instance provides temporary, automatically-rotated credentials via the instance metadata service. You never store long-lived keys, which is the security best practice.",
    },
    {
      type: "mcq",
      difficulty: "medium",
      domainId: "design-secure",
      topic: "Encryption",
      question:
        "A company must encrypt data at rest in S3 using keys they can centrally manage, rotate, and audit usage of via CloudTrail. Which option meets this?",
      options: ["SSE-S3", "SSE-KMS with a customer managed key", "SSE-C", "No encryption needed"],
      correctIndices: [1],
      explanation:
        "SSE-KMS with a customer managed key (CMK) gives you control over key policies and rotation, and every key use is logged in CloudTrail. SSE-S3 uses AWS-managed keys with no audit trail of individual key usage.",
    },
    {
      type: "mcq",
      difficulty: "medium",
      domainId: "design-secure",
      topic: "Security groups & NACLs",
      question: "Which statement about security groups and network ACLs is correct?",
      options: [
        "Security groups are stateless; NACLs are stateful",
        "Security groups are stateful; NACLs are stateless",
        "Both are stateful",
        "Both are stateless",
      ],
      correctIndices: [1],
      explanation:
        "Security groups are stateful — return traffic is automatically allowed. NACLs are stateless — you must explicitly allow both inbound and the corresponding outbound (ephemeral port) traffic.",
    },
    {
      type: "scenario",
      difficulty: "hard",
      domainId: "design-secure",
      topic: "Cross-account access",
      question:
        "Account A's Lambda function must access a DynamoDB table in Account B. What is the most secure design?",
      options: [
        "Share Account B's IAM user access keys with Account A",
        "Create an IAM role in Account B that trusts Account A, and have the function assume it via STS",
        "Make the DynamoDB table publicly accessible",
        "Copy the data into Account A on a schedule",
      ],
      correctIndices: [1],
      explanation:
        "Cross-account access uses an IAM role in the resource-owning account (B) with a trust policy allowing the principal in Account A to call sts:AssumeRole. This grants temporary credentials with no shared long-lived secrets.",
    },
    {
      type: "mcq",
      difficulty: "easy",
      domainId: "design-secure",
      topic: "Secrets management",
      question:
        "Which service stores database credentials and can automatically rotate them on a schedule?",
      options: ["AWS Secrets Manager", "S3 with encryption", "AWS Config", "CloudTrail"],
      correctIndices: [0],
      explanation:
        "Secrets Manager stores secrets encrypted with KMS and supports automatic rotation using Lambda. SSM Parameter Store can store secrets but does not natively rotate them.",
    },
    {
      type: "scenario",
      difficulty: "medium",
      domainId: "design-resilient",
      topic: "Decoupling",
      question:
        "Traffic spikes overwhelm a backend that processes orders synchronously, causing dropped requests. Which change improves resilience with minimal code?",
      options: [
        "Put orders on an Amazon SQS queue and have the backend poll and process them",
        "Increase the EC2 instance size",
        "Move the backend to a single larger AZ",
        "Disable retries on the client",
      ],
      correctIndices: [0],
      explanation:
        "SQS decouples the producer from the consumer, absorbing spikes as a buffer. The backend processes messages at its own pace and nothing is dropped, even if the consumer is briefly down.",
    },
    {
      type: "mcq",
      difficulty: "medium",
      domainId: "design-resilient",
      topic: "RDS high availability",
      question:
        "Which RDS feature provides automatic failover to a synchronously-replicated standby in another Availability Zone?",
      options: [
        "Read replicas",
        "Multi-AZ deployment",
        "Larger instance class",
        "Manual snapshots",
      ],
      correctIndices: [1],
      explanation:
        "Multi-AZ maintains a synchronous standby in a second AZ and fails over automatically. Read replicas use asynchronous replication and are for scaling reads, not automatic HA.",
    },
    {
      type: "multi-select",
      difficulty: "hard",
      domainId: "design-resilient",
      topic: "Fan-out messaging",
      question:
        "You need each incoming event delivered to several independent processing queues. Which TWO components implement this fan-out pattern?",
      options: [
        "Publish events to an Amazon SNS topic",
        "Subscribe multiple Amazon SQS queues to the SNS topic",
        "Write events directly to a single SQS queue",
        "Use a single Lambda with no queue",
        "Store events in S3 and poll the bucket",
      ],
      correctIndices: [0, 1],
      explanation:
        "The fan-out pattern publishes a message to an SNS topic that has multiple SQS queues subscribed; SNS delivers a copy to each queue so consumers process independently and durably.",
    },
    {
      type: "mcq",
      difficulty: "easy",
      domainId: "design-resilient",
      topic: "Auto Scaling",
      question:
        "To survive the failure of an entire Availability Zone, how should an Auto Scaling group be configured?",
      options: [
        "Span subnets across multiple Availability Zones",
        "Use a single AZ with a large instance",
        "Disable health checks",
        "Set min and max capacity to 1",
      ],
      correctIndices: [0],
      explanation:
        "An ASG spanning multiple AZs redistributes capacity to healthy AZs if one fails, providing fault tolerance. Combine with an ELB for traffic distribution.",
    },
    {
      type: "mcq",
      difficulty: "medium",
      domainId: "design-performant",
      topic: "Content delivery",
      question:
        "Global users report slow load times for static images served from S3 in us-east-1. What reduces latency most effectively?",
      options: [
        "Serve the content through Amazon CloudFront",
        "Enable S3 Transfer Acceleration for downloads",
        "Move the bucket to a larger storage class",
        "Increase the EC2 instance size",
      ],
      correctIndices: [0],
      explanation:
        "CloudFront caches content at edge locations close to users, dramatically reducing latency for globally-distributed static assets.",
    },
    {
      type: "mcq",
      difficulty: "medium",
      domainId: "design-performant",
      topic: "Caching",
      question:
        "A read-heavy application repeatedly queries the same database rows, straining the DB. What is the best performance fix?",
      options: [
        "Add an ElastiCache layer to cache frequent reads",
        "Switch to a smaller DB instance",
        "Disable Multi-AZ",
        "Move the database to a single AZ",
      ],
      correctIndices: [0],
      explanation:
        "ElastiCache (Redis or Memcached) caches hot data in memory, offloading repeated reads from the database and lowering latency.",
    },
    {
      type: "mcq",
      difficulty: "medium",
      domainId: "design-performant",
      topic: "Storage selection",
      question:
        "Multiple EC2 instances across AZs must read and write the same files concurrently via a POSIX file system. Which service fits?",
      options: ["Amazon EFS", "Amazon EBS", "Instance store", "Amazon S3 Glacier"],
      correctIndices: [0],
      explanation:
        "EFS is a managed, elastic NFS file system that can be mounted by many instances across AZs simultaneously. EBS volumes attach to a single instance (in one AZ) at a time.",
    },
    {
      type: "mcq",
      difficulty: "hard",
      domainId: "design-performant",
      topic: "Databases",
      question:
        "An application needs single-digit millisecond latency at virtually unlimited scale for key-value access. Which database is the best fit?",
      options: ["Amazon DynamoDB", "Amazon RDS for MySQL", "Amazon Redshift", "Amazon Aurora Serverless"],
      correctIndices: [0],
      explanation:
        "DynamoDB is a fully-managed NoSQL key-value store delivering consistent single-digit-millisecond performance at any scale. Redshift is for analytics; RDS/Aurora are relational.",
    },
    {
      type: "mcq",
      difficulty: "easy",
      domainId: "design-cost",
      topic: "EC2 pricing",
      question:
        "A nightly batch job is fault-tolerant and can be interrupted and resumed. Which purchasing option minimizes cost?",
      options: ["Spot Instances", "On-Demand Instances", "Dedicated Hosts", "Reserved Instances"],
      correctIndices: [0],
      explanation:
        "Spot Instances offer up to ~90% savings over On-Demand and are ideal for interruptible, fault-tolerant workloads like batch processing.",
    },
    {
      type: "mcq",
      difficulty: "medium",
      domainId: "design-cost",
      topic: "S3 storage classes",
      question:
        "Objects have unpredictable, changing access patterns and you want to optimize storage cost automatically without performance impact. Which S3 storage class fits?",
      options: [
        "S3 Intelligent-Tiering",
        "S3 Glacier Deep Archive",
        "S3 One Zone-IA",
        "S3 Standard only",
      ],
      correctIndices: [0],
      explanation:
        "S3 Intelligent-Tiering automatically moves objects between access tiers based on usage, optimizing cost with no retrieval fees and no performance impact — ideal for unknown/changing patterns.",
    },
    {
      type: "mcq",
      difficulty: "medium",
      domainId: "design-cost",
      topic: "Commitment discounts",
      question:
        "A company runs a steady, predictable EC2 workload 24/7 for the next three years and wants the lowest compute cost with flexibility across instance families. What should they use?",
      options: [
        "Compute Savings Plans",
        "Spot Instances",
        "On-Demand Instances",
        "More frequent snapshots",
      ],
      correctIndices: [0],
      explanation:
        "Compute Savings Plans give large discounts for a 1- or 3-year hourly spend commitment and apply flexibly across instance families, sizes, regions, and even Fargate/Lambda — best for steady, predictable usage.",
    },
  ],

  flashcards: [
    {
      category: "IAM",
      difficulty: "easy",
      question: "What is an IAM role?",
      answer:
        "An identity with permissions that can be assumed by trusted entities (EC2, Lambda, users, other accounts). It provides temporary, automatically-rotated credentials — no long-lived keys.",
    },
    {
      category: "Encryption",
      difficulty: "medium",
      question: "SSE-S3 vs SSE-KMS — when do you choose SSE-KMS?",
      answer:
        "Choose SSE-KMS when you need control over the encryption keys (key policies, rotation) and an audit trail of key usage in CloudTrail. SSE-S3 uses AWS-managed keys with no per-use audit.",
    },
    {
      category: "Networking",
      difficulty: "medium",
      question: "Security group vs NACL: stateful or stateless?",
      answer:
        "Security groups are STATEFUL (return traffic auto-allowed) and operate at the instance/ENI level, allow-rules only. NACLs are STATELESS (must allow both directions) and operate at the subnet level, with allow and deny rules.",
    },
    {
      category: "Databases",
      difficulty: "medium",
      question: "RDS Multi-AZ vs Read Replica?",
      answer:
        "Multi-AZ = synchronous standby in another AZ for automatic failover (high availability). Read Replica = asynchronous copy for scaling read traffic (and can be promoted manually).",
    },
    {
      category: "Messaging",
      difficulty: "medium",
      question: "SQS Standard vs FIFO queues?",
      answer:
        "Standard: nearly unlimited throughput, at-least-once delivery, best-effort ordering. FIFO: exactly-once processing and strict ordering, with throughput limits (higher with batching/high-throughput mode).",
    },
    {
      category: "Messaging",
      difficulty: "easy",
      question: "SNS vs SQS in one line?",
      answer:
        "SNS is push-based pub/sub (one message → many subscribers). SQS is pull-based queuing (one message → one consumer). Combine SNS+SQS for durable fan-out.",
    },
    {
      category: "Storage",
      difficulty: "medium",
      question: "EBS vs EFS vs Instance Store?",
      answer:
        "EBS: network block storage for one instance (AZ-scoped), persistent. EFS: shared NFS file system across many instances/AZs, elastic. Instance store: ephemeral local disk, lost on stop/terminate.",
    },
    {
      category: "Storage",
      difficulty: "easy",
      question: "Name the main S3 storage classes by use case.",
      answer:
        "Standard (frequent), Intelligent-Tiering (unknown patterns), Standard-IA / One Zone-IA (infrequent), Glacier Instant/Flexible Retrieval and Deep Archive (archive, cheapest, slower retrieval).",
    },
    {
      category: "Performance",
      difficulty: "easy",
      question: "When do you reach for CloudFront?",
      answer:
        "To reduce latency for globally-distributed users by caching static (and dynamic) content at edge locations, and to offload origin traffic. Integrates with S3, ALB, and custom origins.",
    },
    {
      category: "Performance",
      difficulty: "medium",
      question: "ElastiCache Redis vs Memcached?",
      answer:
        "Redis: rich data types, persistence, replication, pub/sub, sorted sets — use when you need durability/HA. Memcached: simple, multi-threaded, horizontally scalable cache — use for pure, simple caching.",
    },
    {
      category: "Compute",
      difficulty: "medium",
      question: "Spot vs On-Demand vs Reserved/Savings Plans?",
      answer:
        "Spot: cheapest, can be interrupted — for fault-tolerant/batch. On-Demand: pay-as-you-go, no commitment. Reserved Instances / Savings Plans: large discount for 1–3 year commitment — for steady workloads.",
    },
    {
      category: "Networking",
      difficulty: "medium",
      question: "What does a NAT Gateway do?",
      answer:
        "Lets instances in a PRIVATE subnet make outbound internet connections (e.g., updates) while preventing the internet from initiating inbound connections to them. It lives in a public subnet.",
    },
    {
      category: "Networking",
      difficulty: "hard",
      question: "Route 53 routing policies — name the key ones.",
      answer:
        "Simple, Weighted, Latency-based, Failover, Geolocation, Geoproximity, and Multivalue answer. Failover + health checks enables active-passive DR.",
    },
    {
      category: "Resilience",
      difficulty: "easy",
      question: "How do you make an Auto Scaling group fault-tolerant?",
      answer:
        "Configure it to span multiple Availability Zones and front it with an Elastic Load Balancer, with health checks so unhealthy instances are replaced automatically.",
    },
    {
      category: "Databases",
      difficulty: "hard",
      question: "When choose DynamoDB over RDS?",
      answer:
        "Choose DynamoDB for key-value/document access needing single-digit-ms latency at massive scale with a flexible schema. Choose RDS/Aurora for relational data, complex joins, and SQL transactions.",
    },
    {
      category: "Cost",
      difficulty: "medium",
      question: "What does S3 Intelligent-Tiering do?",
      answer:
        "Automatically moves objects between frequent and infrequent access tiers based on usage, optimizing cost with no retrieval fees and no performance impact — ideal for unknown or changing access patterns.",
    },
  ],

  cheatSheets: [
    {
      topic: "S3 vs EBS vs EFS",
      definition:
        "The three core AWS storage services for object, block, and file workloads respectively. Choosing correctly is a recurring SAA-C03 theme.",
      architecture:
        "S3 is regional object storage accessed over HTTPS APIs. EBS is block storage attached to a single EC2 instance within one AZ. EFS is a managed NFS file system mountable by many instances across multiple AZs.",
      useCases: [
        "S3: static assets, backups, data lakes, logs, media",
        "EBS: boot volumes and databases needing low-latency block access for one instance",
        "EFS: shared content/home directories accessed by a fleet of instances",
      ],
      bestPractices: [
        "Use S3 lifecycle rules to transition to cheaper classes automatically",
        "Use gp3 EBS volumes for a better price/performance baseline than gp2",
        "Enable encryption at rest on all three (KMS)",
      ],
      commonMistakes: [
        "Trying to share one EBS volume across many instances (not its model — use EFS)",
        "Storing static website assets on EBS instead of S3 + CloudFront",
        "Forgetting EBS is AZ-scoped — snapshots are needed to move across AZs",
      ],
      comparisonTables: [
        {
          title: "Storage comparison",
          headers: ["Attribute", "S3", "EBS", "EFS"],
          rows: [
            ["Type", "Object", "Block", "File (NFS)"],
            ["Scope", "Region", "Single AZ / one instance", "Multi-AZ, many instances"],
            ["Access", "HTTPS API", "Mounted volume", "POSIX mount"],
            ["Scaling", "Unlimited", "Provisioned size", "Elastic / automatic"],
            ["Typical use", "Assets, backups", "DB & boot volumes", "Shared files"],
          ],
        },
      ],
      examTips: [
        "“Shared across many instances/AZs” → EFS",
        "“Object storage / static website / cheapest durable” → S3",
        "“Low-latency block volume for one instance/DB” → EBS",
      ],
      interviewTips: [
        "Be ready to justify cost trade-offs: S3 storage classes vs EBS provisioned IOPS vs EFS throughput modes.",
      ],
    },
    {
      topic: "SQS vs SNS",
      definition:
        "AWS's core decoupling primitives: SQS is a pull-based message queue; SNS is push-based publish/subscribe. They are frequently combined for durable fan-out.",
      architecture:
        "SQS stores messages until a consumer polls and deletes them (one message → one consumer). SNS pushes each published message to all subscribers (queues, Lambda, HTTP, email). Subscribing SQS queues to an SNS topic gives durable fan-out.",
      useCases: [
        "SQS: buffer spikes, decouple producers/consumers, work queues",
        "SNS: broadcast events, alerting, fan-out to multiple systems",
        "SNS + SQS: deliver each event durably to several independent consumers",
      ],
      bestPractices: [
        "Use a dead-letter queue (DLQ) for messages that repeatedly fail",
        "Use FIFO queues when ordering / exactly-once matters",
        "Set visibility timeout longer than processing time to avoid duplicates",
      ],
      commonMistakes: [
        "Using SNS alone when you need durability/retry (subscribers must be available) — add SQS",
        "Expecting strict ordering from Standard queues (use FIFO)",
        "Setting visibility timeout too short, causing double processing",
      ],
      comparisonTables: [
        {
          title: "SQS vs SNS",
          headers: ["Attribute", "SQS", "SNS"],
          rows: [
            ["Model", "Pull (poll)", "Push (pub/sub)"],
            ["Delivery", "One consumer per message", "All subscribers"],
            ["Persistence", "Stores until consumed", "Not stored (deliver-and-forget)"],
            ["Ordering", "FIFO option", "FIFO topic option"],
          ],
        },
      ],
      examTips: [
        "“Deliver to multiple independent systems” → SNS (often SNS→SQS fan-out)",
        "“Buffer / absorb spikes / process at own pace” → SQS",
      ],
      interviewTips: [
        "Explain idempotency: with at-least-once delivery, consumers must handle duplicate messages safely.",
      ],
    },
  ],
};
