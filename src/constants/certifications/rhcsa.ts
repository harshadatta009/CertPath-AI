import type { CertificationConfig } from "@/types";

/**
 * Red Hat Certified System Administrator (RHCSA) – EX200
 *
 * EX200 is a performance-based, hands-on lab exam: there are no multiple-choice
 * questions, no published per-objective weightings, and configurations must
 * persist across reboot without intervention. Red Hat does not publish domain
 * weightage percentages, so the `weightage` values below are reasonable
 * estimates based on objective breadth and are normalized to sum to 100.
 *
 * Objectives mirror the official EX200 objectives page (current RHEL 9 track).
 * Exam metadata (2.5 hours, 210/300 passing score, ~$500 USD) reflects the
 * published Red Hat exam details.
 */
export const rhcsa: CertificationConfig = {
  id: "rhcsa-ex200",
  provider: "redhat",
  code: "EX200",
  name: "Red Hat Certified System Administrator",
  tagline:
    "Prove core Red Hat Enterprise Linux administration skills in a hands-on, performance-based lab exam.",
  description:
    "Validates the practical Linux system administration skills required to manage Red Hat Enterprise Linux 9 across a wide range of environments. The exam is entirely performance-based: candidates complete real configuration tasks on live systems that must survive a reboot.",
  level: "associate",
  color: "#EE0000",
  recommendedHours: 90,
  tags: ["redhat", "linux", "rhel", "sysadmin", "hands-on"],
  available: true,
  exam: {
    questionCount: 0,
    durationMinutes: 150,
    passingScore: 210,
    maxScore: 300,
    priceUsd: 500,
    formats: ["scenario"],
    validityYears: 3,
  },
  domains: [
    {
      id: "essential-tools",
      name: "Understand and Use Essential Tools",
      weightage: 14,
      recommendedHours: 12,
      topics: [
        { id: "shell-commands", name: "Use the shell prompt and command syntax" },
        { id: "io-redirection", name: "Input/output redirection (>, >>, |, 2>)" },
        { id: "grep-regex", name: "Analyze text with grep and regular expressions" },
        { id: "ssh-access", name: "Access remote systems using SSH" },
        { id: "archive-compress", name: "Archive and compress with tar, gzip, and bzip2" },
        { id: "files-and-links", name: "Manage files, directories, and hard/soft links" },
        { id: "ugo-permissions", name: "Set standard ugo/rwx permissions" },
      ],
    },
    {
      id: "operate-running-systems",
      name: "Operate Running Systems",
      weightage: 13,
      recommendedHours: 12,
      topics: [
        { id: "boot-reboot-shutdown", name: "Boot, reboot, and shut down systems" },
        { id: "boot-targets", name: "Boot into and interrupt different systemd targets" },
        { id: "process-management", name: "Identify and kill CPU/memory-intensive processes" },
        { id: "process-scheduling", name: "Adjust process scheduling and tuning profiles" },
        { id: "logs-journals", name: "Locate, interpret, and preserve logs and journals" },
        { id: "network-services", name: "Start, stop, and check network services" },
      ],
    },
    {
      id: "manage-software",
      name: "Manage Software and Shell Scripts",
      weightage: 12,
      recommendedHours: 11,
      topics: [
        { id: "rpm-repos", name: "Configure access to RPM repositories" },
        { id: "rpm-packages", name: "Install and remove RPM packages with dnf" },
        { id: "flatpak", name: "Configure repos and manage Flatpak packages" },
        { id: "shell-conditionals", name: "Conditional logic in scripts (if, test, [])" },
        { id: "shell-loops", name: "Looping constructs and script inputs ($1, $2)" },
      ],
    },
    {
      id: "local-storage-lvm",
      name: "Configure Local Storage and LVM",
      weightage: 14,
      recommendedHours: 14,
      topics: [
        { id: "gpt-partitions", name: "List, create, and delete partitions on GPT disks" },
        { id: "physical-volumes", name: "Create and remove LVM physical volumes" },
        { id: "volume-groups", name: "Assign physical volumes to volume groups" },
        { id: "logical-volumes", name: "Create, extend, and delete logical volumes" },
        { id: "mount-by-uuid", name: "Mount file systems at boot by UUID or label" },
        { id: "add-swap", name: "Add partitions, logical volumes, and swap non-destructively" },
      ],
    },
    {
      id: "file-systems",
      name: "Create and Configure File Systems",
      weightage: 11,
      recommendedHours: 9,
      topics: [
        { id: "create-filesystems", name: "Create and use VFAT, ext4, and XFS file systems" },
        { id: "nfs-mounts", name: "Mount and unmount NFS network file systems" },
        { id: "autofs", name: "Configure autofs for on-demand mounting" },
        { id: "extend-lvs", name: "Extend existing logical volumes and file systems" },
        { id: "fix-permissions", name: "Diagnose and correct file permission problems" },
      ],
    },
    {
      id: "deploy-configure-maintain",
      name: "Deploy, Configure, and Maintain Systems",
      weightage: 12,
      recommendedHours: 11,
      topics: [
        { id: "scheduled-tasks", name: "Schedule tasks with at, cron, and systemd timers" },
        { id: "manage-services", name: "Enable, start, and stop services at boot" },
        { id: "default-target", name: "Configure the system to boot into a specific target" },
        { id: "time-clients", name: "Configure time service (chrony) clients" },
        { id: "bootloader", name: "Modify the GRUB2 system bootloader" },
        { id: "networking", name: "Configure IPv4/IPv6 addresses and hostname resolution" },
      ],
    },
    {
      id: "users-and-groups",
      name: "Manage Users and Groups",
      weightage: 11,
      recommendedHours: 10,
      topics: [
        { id: "local-users", name: "Create, delete, and modify local user accounts" },
        { id: "password-aging", name: "Set passwords and adjust password aging" },
        { id: "local-groups", name: "Create, delete, and modify groups and memberships" },
        { id: "privileged-access", name: "Configure privileged access with sudo" },
        { id: "default-perms", name: "Manage default file permissions (umask)" },
      ],
    },
    {
      id: "security-selinux-firewall",
      name: "Manage Security, SELinux, and Firewall",
      weightage: 13,
      recommendedHours: 11,
      topics: [
        { id: "firewalld", name: "Restrict access with firewalld and firewall-cmd" },
        { id: "ssh-keys", name: "Configure key-based authentication for SSH" },
        { id: "selinux-modes", name: "Set SELinux enforcing and permissive modes" },
        { id: "selinux-contexts", name: "List, identify, and restore SELinux file/process contexts" },
        { id: "selinux-ports", name: "Manage SELinux port labels" },
        { id: "selinux-booleans", name: "Modify SELinux behavior with booleans" },
      ],
    },
  ],
};
