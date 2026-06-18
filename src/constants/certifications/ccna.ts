import type { CertificationConfig } from "@/types";

export const ccna: CertificationConfig = {
  id: "ccna-200-301",
  provider: "cisco",
  code: "200-301",
  name: "Cisco Certified Network Associate",
  tagline:
    "Validate your foundational skills in networking fundamentals, IP connectivity, security, and automation.",
  description:
    "The CCNA (200-301) certification proves you can install, configure, and troubleshoot modern enterprise networks. It covers network fundamentals, access, IP connectivity and services, security fundamentals, and the automation and programmability skills today's networks demand.",
  level: "associate",
  color: "#1BA0D7",
  recommendedHours: 140,
  domains: [
    {
      id: "network-fundamentals",
      name: "Network Fundamentals",
      weightage: 20,
      recommendedHours: 30,
      topics: [
        {
          id: "network-components",
          name: "Network Components",
          description:
            "Role and function of routers, Layer 2/3 switches, next-generation firewalls and IPS, access points, controllers, endpoints, servers, and PoE.",
        },
        {
          id: "topology-architectures",
          name: "Network Topology Architectures",
          description:
            "Two-tier, three-tier, spine-leaf, WAN, SOHO, and on-premises versus cloud designs.",
        },
        {
          id: "cabling-and-interfaces",
          name: "Physical Interfaces and Cabling",
          description:
            "Single-mode fiber, multimode fiber, and copper media; identifying interface and cable issues such as collisions, errors, and duplex/speed mismatches.",
        },
        {
          id: "ipv4-addressing-subnetting",
          name: "IPv4 Addressing and Subnetting",
          description:
            "Configure and verify IPv4 addressing and subnetting, including private addressing and TCP versus UDP behavior.",
        },
        {
          id: "ipv6-addressing",
          name: "IPv6 Addressing",
          description:
            "Configure and verify IPv6 addressing and prefixes and describe address types (unicast, anycast, multicast, modified EUI-64).",
        },
        {
          id: "switching-concepts",
          name: "Switching Concepts",
          description:
            "MAC learning and aging, frame switching, frame flooding, and the MAC address table.",
        },
        {
          id: "wireless-and-virtualization",
          name: "Wireless and Virtualization Principles",
          description:
            "Wireless fundamentals (channels, SSID, RF, encryption) and virtualization fundamentals including server virtualization, containers, and VRFs.",
        },
      ],
    },
    {
      id: "network-access",
      name: "Network Access",
      weightage: 20,
      recommendedHours: 28,
      topics: [
        {
          id: "vlans",
          name: "VLANs",
          description:
            "Configure and verify normal-range VLANs spanning multiple switches, including access ports, default VLAN, and inter-VLAN connectivity.",
        },
        {
          id: "interswitch-connectivity",
          name: "Interswitch Connectivity",
          description:
            "Configure and verify trunk ports, 802.1Q encapsulation, and the native VLAN.",
        },
        {
          id: "discovery-and-etherchannel",
          name: "Discovery Protocols and EtherChannel",
          description:
            "Layer 2 discovery protocols (CDP and LLDP) and Layer 2/Layer 3 EtherChannel using LACP.",
        },
        {
          id: "spanning-tree",
          name: "Rapid PVST+ Spanning Tree",
          description:
            "Interpret operations including root bridge/port selection, port states and roles, PortFast, and guard features.",
        },
        {
          id: "wireless-architectures",
          name: "Wireless Architectures",
          description:
            "Cisco wireless architectures and AP modes, plus physical infrastructure connections of WLAN components (AP, WLC, ports, LAG).",
        },
        {
          id: "wlan-management-and-config",
          name: "WLAN Management and Configuration",
          description:
            "Network device management access (Telnet, SSH, HTTP/HTTPS, console, TACACS+/RADIUS, cloud managed) and interpreting WLAN GUI configuration for client connectivity.",
        },
      ],
    },
    {
      id: "ip-connectivity",
      name: "IP Connectivity",
      weightage: 25,
      recommendedHours: 34,
      topics: [
        {
          id: "routing-table-components",
          name: "Routing Table Components",
          description:
            "Interpret routing protocol codes, prefix, network mask, next hop, administrative distance, metric, and gateway of last resort.",
        },
        {
          id: "forwarding-decisions",
          name: "Router Forwarding Decisions",
          description:
            "How a router forwards by default using longest prefix match, administrative distance, and routing protocol metric.",
        },
        {
          id: "static-routing",
          name: "Static Routing",
          description:
            "Configure and verify IPv4 and IPv6 static routing including default, network, host, and floating static routes.",
        },
        {
          id: "ospfv2",
          name: "Single-Area OSPFv2",
          description:
            "Configure and verify neighbor adjacencies, point-to-point and broadcast networks (DR/BDR selection), and router ID.",
        },
        {
          id: "first-hop-redundancy",
          name: "First Hop Redundancy Protocols",
          description:
            "Describe the purpose, functions, and concepts of first hop redundancy protocols.",
        },
      ],
    },
    {
      id: "ip-services",
      name: "IP Services",
      weightage: 10,
      recommendedHours: 16,
      topics: [
        {
          id: "nat",
          name: "Network Address Translation",
          description:
            "Configure and verify inside source NAT using static mappings and pools.",
        },
        {
          id: "ntp",
          name: "Network Time Protocol",
          description: "Configure and verify NTP operating in client and server mode.",
        },
        {
          id: "dhcp-and-dns",
          name: "DHCP and DNS",
          description:
            "Explain the role of DHCP and DNS, and configure and verify DHCP client and relay.",
        },
        {
          id: "snmp-and-syslog",
          name: "SNMP and Syslog",
          description:
            "Function of SNMP in network operations and the use of syslog features including facilities and severity levels.",
        },
        {
          id: "qos",
          name: "Quality of Service",
          description:
            "Per-hop behavior for QoS such as classification, marking, queuing, congestion, policing, and shaping.",
        },
        {
          id: "remote-access-and-file-transfer",
          name: "Remote Access and File Transfer",
          description:
            "Configure remote access using SSH and describe the capabilities of TFTP/FTP in the network.",
        },
      ],
    },
    {
      id: "security-fundamentals",
      name: "Security Fundamentals",
      weightage: 15,
      recommendedHours: 20,
      topics: [
        {
          id: "security-concepts",
          name: "Key Security Concepts",
          description:
            "Threats, vulnerabilities, exploits, mitigation techniques, and security program elements (awareness, training, physical access control).",
        },
        {
          id: "device-access-control",
          name: "Device Access Control",
          description:
            "Configure and verify device access control using local passwords and describe password policy elements and alternatives (MFA, certificates, biometrics).",
        },
        {
          id: "vpns",
          name: "VPNs",
          description: "Describe IPsec remote access and site-to-site VPNs.",
        },
        {
          id: "access-control-lists",
          name: "Access Control Lists",
          description: "Configure and verify access control lists.",
        },
        {
          id: "layer-2-security",
          name: "Layer 2 Security Features",
          description:
            "Configure and verify DHCP snooping, dynamic ARP inspection, and port security.",
        },
        {
          id: "aaa-and-wireless-security",
          name: "AAA and Wireless Security",
          description:
            "Compare authentication, authorization, and accounting concepts; describe wireless security protocols (WPA, WPA2, WPA3) and configure a WLAN using WPA2 PSK.",
        },
      ],
    },
    {
      id: "automation-and-programmability",
      name: "Automation and Programmability",
      weightage: 10,
      recommendedHours: 12,
      topics: [
        {
          id: "automation-impact",
          name: "Automation Impact",
          description:
            "Explain how automation impacts network management and compare traditional networks with controller-based networking.",
        },
        {
          id: "sdn-architecture",
          name: "Software-Defined Architecture",
          description:
            "Controller-based, software-defined architecture (overlay, underlay, fabric), control/data plane separation, and northbound/southbound APIs.",
        },
        {
          id: "ai-ml-in-networking",
          name: "AI and ML in Network Operations",
          description:
            "Explain generative and predictive AI and machine learning in network operations.",
        },
        {
          id: "rest-apis",
          name: "REST-Based APIs",
          description:
            "Characteristics of REST-based APIs including authentication types, CRUD, HTTP verbs, and data encoding.",
        },
        {
          id: "config-management-and-json",
          name: "Configuration Management and JSON",
          description:
            "Recognize capabilities of configuration management tools such as Ansible and Terraform, and components of JSON-encoded data.",
        },
      ],
    },
  ],
  exam: {
    questionCount: 100,
    durationMinutes: 120,
    passingScore: 825,
    maxScore: 1000,
    priceUsd: 300,
    formats: ["mcq", "multi-select", "scenario"],
    validityYears: 3,
  },
  tags: ["cisco", "networking", "associate", "ccna"],
  available: true,
};
