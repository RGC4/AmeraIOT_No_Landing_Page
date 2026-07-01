'use client';

import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import { tm } from '@/components/tm';

import { industryMeta } from './industry-meta';

interface UseCase {
  title: string;
  body: string;
}

interface IndustryContent {
  challenges?: string[];
  solution?: { heading: string; points: string[] };
  benefits?: { label: string; desc: string }[];
  positioning?: string;
}

const useCasesBySlug: Record<string, UseCase[]> = {
  manufacturing: [
    {
      title: 'Replacing Per-Device X.509 Certificates on OT Networks',
      body: 'Managing certificate lifecycle for thousands or millions of PLCs and sensors is operationally impossible. AmeraKey replaces per-device certificates with deterministic, hardware-rooted identity that never expires and requires no CA infrastructure.',
    },
    {
      title: 'Eliminating PKI for Internal SCADA/OT Encryption',
      body: 'Internal SCADA, historian, and DCS systems often run on long-lived TLS certificates that expire silently. AmeraKey replaces these certificates with auto-rotating symmetric transport keys, removing renewal calendars and reducing OT attack surface.',
    },
    {
      title: 'Encryption Key Governance for Operational Data Stores',
      body: 'Historian logs, production recipes, and IP repositories contain highly sensitive operational data. AmeraKey governs all data-at-rest keys with deterministic derivation, rotation, and audit logging — replacing manual HSM scripts and binder-based key tracking.',
    },
  ],
  'oil-gas': [
    {
      title: 'Securing Field Telemetry',
      body: 'Pressure, flow, vibration, leak-detection, and seismic data drive critical safety and production decisions. AmeraKey authenticates devices and encrypts telemetry at the source, ensuring operators can trust every reading and detect tampering immediately.',
    },
    {
      title: 'Protecting SCADA/ICS Commands',
      body: 'Commands sent to pumps, valves, controllers, and drilling equipment are cryptographically authenticated before execution. Spoofed, replayed, or modified instructions are rejected automatically, reducing operational and safety risk.',
    },
    {
      title: 'Offline-First Field Operations',
      body: 'Offshore rigs, desert pumping stations, and unmanned sites often operate without reliable connectivity. AmeraKey provides full authentication and encryption entirely offline — no CA, no cloud, no dependency on external trust chains.',
    },
    {
      title: 'Securing High-Value Geological & Seismic Data',
      body: 'Exploration and reservoir data represent some of the industry’s most valuable assets. AmeraKey governs encryption keys for these datasets end-to-end, from field acquisition through transport and long-term storage.',
    },
    {
      title: 'Secure Firmware and Configuration Updates',
      body: 'AmeraKey provides deterministic signing primitives that integrators use to verify firmware origin and integrity, blocking unauthorized or tampered updates before they reach field devices.',
    },
  ],
  utilities: [
    {
      title: 'Eliminating Expired Certificates on Internal SCADA Communications',
      body: 'Internal SCADA, EMS, and DCS systems often run on long-lived certificates that are difficult to track and easy to miss. AmeraKey replaces these certificates with auto-rotating symmetric transport keys, removing renewal calendars and reducing operational risk.',
    },
    {
      title: 'Replacing Internal PKI for Substation Remote Access',
      body: 'Certificate-based VPNs and remote-access systems require a PKI that OT teams cannot sustainably operate. AmeraKey provides hardware-rooted, short-lived key-based identity inside these systems, reducing PKI burden without changing network architecture.',
    },
    {
      title: 'Key Governance for Grid Operational Data',
      body: 'Historian logs, telemetry archives, and grid-topology data contain sensitive operational information. AmeraKey governs all data-at-rest keys with deterministic derivation, rotation, and audit logging — replacing manual HSM scripts and spreadsheet-based key tracking.',
    },
    {
      title: 'Device Identity Replacement on Private Smart-Grid Networks',
      body: 'RTUs, IEDs, and sensors deployed across substations and feeders often carry certificates that cannot be practically renewed in the field. AmeraKey provides deterministic, hardware-rooted identity that never expires and requires no certificate lifecycle.',
    },
  ],
  'financial-services': [
    {
      title: 'Eliminating Internal Certificate Authorities for Microservices',
      body: 'Internal service meshes often rely on an internal CA that issues hundreds or thousands of certificates. AmeraKey replaces these certificates with deterministic, hardware-rooted identity that never expires and requires no CA infrastructure.',
    },
    {
      title: 'Preventing Certificate-Driven Outages on API Gateways',
      body: 'API gateways accumulate large inventories of mutual-TLS certificates that must be renewed manually. AmeraKey replaces these static certificates with auto-rotating symmetric transport keys, eliminating expiry-driven outages.',
    },
    {
      title: 'PCI-Aligned Key Governance for Cardholder Data',
      body: 'Databases, data warehouses, and backup systems storing cardholder data require governed key lifecycle aligned to PCI-DSS. AmeraKey provides deterministic derivation, rotation, and audit logging for all data-at-rest keys — replacing spreadsheet-based key tracking.',
    },
    {
      title: 'Payment-System Key Lifecycle Automation',
      body: 'P2PE and PIN-pad systems rely on manual HSM ceremonies that are difficult to scale and audit. AmeraKey provides deterministic key-lifecycle primitives that integrators can use to automate generation, rotation, and logging inside the private payment network.',
    },
    {
      title: 'Secure Internal Service-to-Service Authentication',
      body: 'Trading, settlement, and risk systems require strong mutual authentication without introducing operational fragility. AmeraKey provides certificate-free, hardware-rooted identity that is lightweight, deterministic, and easy to integrate.',
    },
  ],
  'government-and-defense': [
    {
      title: 'Eliminating Internal PKI for System-to-System Authentication',
      body: 'Classified networks often run internal PKI to issue certificates for system-to-system authentication — expensive to operate and fragile to maintain. AmeraKey replaces certificate-based identity with deterministic, hardware-rooted identity that never expires and requires no CA infrastructure.',
    },
    {
      title: 'Air-Gap-Native Identity and Encryption',
      body: 'Air-gapped networks force fully manual certificate lifecycle management. AmeraKey operates entirely offline, providing authentication and encryption without any reliance on external trust chains or online services.',
    },
    {
      title: 'Key Governance for Classified Data Stores',
      body: 'Classified data-at-rest is often governed through manual key binders and auditor-driven ceremonies. AmeraKey provides deterministic derivation, rotation, and audit logging for encryption keys — enabling programmatic governance inside the enclave.',
    },
    {
      title: 'Secure Intra-Agency Workload Identity',
      body: 'Workloads communicating across agency-internal networks often rely on internal CA-issued certificates that cross organizational boundaries poorly. AmeraKey enables direct key-based mutual authentication between internal workloads, removing fragile cross-CA trust chains.',
    },
    {
      title: 'ATO-Ready Key and Identity Evidence',
      body: 'AmeraKey logs every key lifecycle event, providing exportable evidence that supports ATO packages and CMMC control mappings, while integrating with FIPS-certified AES modules where FIPS-validated encryption is required.',
    },
  ],
  maritime: [
    {
      title: 'Securing Onboard OT and Navigation Systems',
      body: 'ECDIS, radar, AIS, and propulsion systems operate on isolated shipboard networks with limited patching and intermittent connectivity. AmeraKey authenticates devices and encrypts onboard communications entirely offline, rejecting spoofed navigation data or tampered control commands immediately.',
    },
    {
      title: 'Eliminating Certificate Management on Satellite-Linked Fleets',
      body: 'VSAT and satellite links connecting vessels to shore often rely on certificates that cannot be renewed reliably at sea. AmeraKey replaces these certificates with auto-rotating symmetric keys, preventing expiry-driven communication failures.',
    },
    {
      title: 'Protecting Port and Terminal OT Networks',
      body: 'Cranes, gate systems, and terminal operating systems depend on internal PKI that port operators struggle to maintain. AmeraKey replaces certificate-based identity with deterministic, hardware-rooted identity across port OT networks.',
    },
    {
      title: 'Key Governance for Cargo, Manifest, and Logistics Data',
      body: 'Cargo manifests, customs declarations, and logistics records require strong encryption and auditability. AmeraKey governs all data-at-rest keys with deterministic derivation, rotation, and audit logging aligned to IMO and IACS cyber-resilience requirements.',
    },
  ],
  'life-sciences-and-healthcare': [
    {
      title: 'PHI Encryption Key Lifecycle for Internal Data Stores',
      body: 'EHR databases, DICOM archives, and HL7/FHIR repositories require strong encryption and governed key rotation. AmeraKey provides deterministic derivation, rotation, and audit logging for all data-at-rest keys, replacing manual HSM scripts and spreadsheet-based tracking.',
    },
    {
      title: 'Eliminating Device Certificates on Medical IoT Networks',
      body: 'Hospitals operate thousands of connected devices that rely on internal-CA certificates that cannot be renewed at scale. AmeraKey replaces these certificates with deterministic, hardware-rooted identity that never expires and requires no PKI infrastructure.',
    },
    {
      title: 'Preventing Certificate-Driven Downtime in Clinical Integrations',
      body: 'Lab, pharmacy, imaging, and EHR systems often depend on manually renewed certificates that can expire unexpectedly. AmeraKey replaces static certificates with auto-rotating symmetric transport keys, ensuring continuous operation of life-critical workflows.',
    },
    {
      title: 'Key Governance for Clinical Trial and Research Data',
      body: 'Genomic datasets, trial results, and regulatory archives require strict access control and auditability. AmeraKey provides deterministic key lifecycle governance aligned with 21 CFR Part 11-related workflows.',
    },
  ],
  retail: [
    {
      title: 'Eliminating Certificate-Driven Outages on POS Networks',
      body: 'POS terminals and store controllers often rely on internal or brand-CA certificates that can expire unexpectedly. AmeraKey replaces these certificates with deterministic, hardware-rooted identity that never expires and requires no PKI infrastructure.',
    },
    {
      title: 'Preventing Checkout Lane Downtime',
      body: 'A single expired certificate can disable a checkout lane or disrupt payment authorization. AmeraKey uses auto-rotating symmetric keys for transport encryption, eliminating renewal calendars and reducing operational fragility.',
    },
    {
      title: 'PCI-Aligned Key Governance for the CDE',
      body: 'Databases, warehouses, and backup systems storing cardholder data require governed key lifecycle aligned to PCI-DSS 3.5–3.7. AmeraKey provides deterministic derivation, rotation, and audit logging for all data-at-rest keys — replacing spreadsheet-based key tracking.',
    },
    {
      title: 'Tokenization Vault Key Lifecycle Automation',
      body: 'Tokenization vaults hold some of the most sensitive assets in retail payments. AmeraKey governs vault encryption keys with deterministic rotation and auditability, enabling predictable, policy-driven key management.',
    },
    {
      title: 'Secure Store-to-Datacenter Communication',
      body: 'Store controllers, inventory systems, and back-office applications require strong mutual authentication without introducing certificate sprawl. AmeraKey provides certificate-free, hardware-rooted identity that is lightweight and easy to integrate.',
    },
  ],
  telecommunications: [
    {
      title: 'Eliminating Internal PKI for 5G Network Functions',
      body: 'The 5G SBA requires TLS between NFs, but certificate renewal is brittle when NFs scale dynamically. AmeraKey replaces per-NF certificates with deterministic, hardware-rooted identity that never expires and requires no CA infrastructure.',
    },
    {
      title: 'Securing Backhaul and Transport Links',
      body: 'Microwave, fiber, and transport links often rely on long-lived certificates that are manually tracked. AmeraKey replaces these certificates with auto-rotating symmetric keys, removing the long-lived certificate exposure window.',
    },
    {
      title: 'Hardening the OSS/BSS and Management Plane',
      body: 'The management plane is the most privileged internal segment and often depends on internal PKI. AmeraKey provides certificate-free, hardware-rooted identity for OSS/BSS systems, reducing attack surface and operational overhead.',
    },
    {
      title: 'Key Governance for Subscriber Data Stores',
      body: 'CDRs, location records, and subscriber profiles require governed encryption keys. AmeraKey provides deterministic derivation, rotation, and audit logging — replacing manual HSM scripts and spreadsheet-based key tracking.',
    },
  ],
  transportation: [
    {
      title: 'Securing Rail Signaling and Positive Train Control',
      body: 'Trackside signaling, interlocking, and PTC systems operate across remote corridors where certificate renewal is impractical. AmeraKey authenticates and encrypts commands entirely offline, rejecting spoofed or replayed signaling instructions.',
    },
    {
      title: 'Certificate-Free Identity for Connected Vehicles and V2X',
      body: 'Vehicles and roadside units must authenticate messages instantly, even when no CA is reachable. AmeraKey provides deterministic, hardware-rooted identity and auto-rotating symmetric keys aligned with ISO/SAE 21434.',
    },
    {
      title: 'Protecting Traffic Management and Tolling Networks',
      body: 'Traffic controllers, tolling gantries, and transit management systems often rely on internal PKI that is difficult to maintain. AmeraKey replaces certificate-based identity with hardware-rooted identity across ITS networks, eliminating renewal calendars.',
    },
    {
      title: 'Key Governance for Passenger, Fare, and Logistics Data',
      body: 'Fare collection, passenger records, and logistics systems require strong encryption and governed key lifecycle. AmeraKey provides deterministic derivation, rotation, and audit logging aligned with TSA Security Directives and PCI-DSS (where payment data is involved).',
    },
  ],
  'information-technology-agentic-ai': [
    {
      title: 'Verifiable Identity for Autonomous Agents',
      body: 'Most agents authenticate with static API keys or bearer tokens that can be copied or replayed. AmeraKey provides deterministic, hardware-rooted identity that cannot be forged and requires no certificate authority.',
    },
    {
      title: 'Mutual Authentication for Agent-to-Agent and Agent-to-Tool Calls',
      body: 'A spoofed or hijacked agent can impersonate a trusted one to exfiltrate data or trigger actions. AmeraKey enforces mutual authentication on every interaction, rejecting rogue or man-in-the-middle agents immediately.',
    },
    {
      title: 'Ephemeral Credentials for Short-Lived Workloads',
      body: 'Agents spin up and tear down constantly, far faster than certificate lifecycles can keep pace. AmeraKey issues short-lived, auto-rotating credentials tied to workload lifecycle — eliminating long-lived secrets in logs or configs.',
    },
    {
      title: 'Governed Key Access to Sensitive Data',
      body: 'Agents increasingly access regulated data inside databases, document stores, and model context. AmeraKey enforces least-privilege, policy-bound key access with deterministic rotation and audit logging.',
    },
    {
      title: 'Tamper-Evident Audit of Autonomous Actions',
      body: 'When agents act without a human in the loop, accountability depends on a trustworthy record. AmeraKey logs every authentication and key operation in tamper-evident form, supporting compliance with emerging AI security standards.',
    },
    {
      title: 'Zero Key Storage on Compromised Agents',
      body: 'If an agent or host is compromised, anything stored locally is exposed. AmeraKey stores no long-term keys on the device — removing the most damaging outcome of agent compromise.',
    },
  ],
  iot: [
    {
      title: 'Certificate-Free Identity for Massive Device Fleets',
      body: 'Provisioning and renewing certificates across millions of sensors, gateways, and actuators is operationally impossible. AmeraKey gives every device deterministic, hardware-rooted identity that never expires and requires no CA infrastructure.',
    },
    {
      title: 'Eliminating PKI on Constrained and Battery-Powered Devices',
      body: 'Many IoT endpoints lack the compute, memory, or power budget to sustain certificate-based identity and renewal. AmeraKey replaces heavyweight PKI with lightweight, deterministic key derivation suited to constrained hardware.',
    },
    {
      title: 'Securing Telemetry from Edge to Cloud',
      body: 'Sensor readings drive automation, billing, and safety decisions, making tampered or spoofed data a serious risk. AmeraKey authenticates devices and encrypts telemetry at the source, so every reading can be trusted end to end.',
    },
    {
      title: 'Offline-Capable Authentication for Disconnected Deployments',
      body: 'Remote and intermittently connected devices cannot depend on a reachable CA or cloud service. AmeraKey performs full authentication and encryption entirely offline, with no external trust chain.',
    },
    {
      title: 'Governed Key Lifecycle for Firmware and OTA Updates',
      body: 'Unauthorized or tampered firmware is one of the most damaging IoT threats. AmeraKey provides deterministic signing primitives integrators use to verify update origin and integrity before it reaches the device.',
    },
    {
      title: 'Zero Key Storage on Physically Exposed Devices',
      body: 'Field-deployed devices are easy to capture and probe. AmeraKey stores no long-term keys on the device — regenerating them only when needed — so physical compromise yields nothing to extract or clone.',
    },
  ],
};

const industryContentBySlug: Record<string, IndustryContent> = {
  manufacturing: {
    challenges: [
      'Modern manufacturing environments rely on millions of PLCs, sensors, robots, and OT systems that were never designed for today’s identity and key-management demands.',
      'Internal SCADA, historian, and DCS traffic still depends on long-lived certificates that expire silently and require a PKI that OT teams cannot realistically operate.',
      'Sensitive operational data — historian logs, production recipes, IP assets — is encrypted with keys tracked manually in binders, spreadsheets, or ad-hoc HSM scripts.',
      'IEC 62443 requires provable identity and key governance, but manual processes cannot deliver the automation, auditability, or scale required across the factory floor.',
    ],
    solution: {
      heading: 'Certificate-Free Device Identity and Automated Key Governance for OT',
      points: [
        'Deterministic, hardware-rooted identity for PLCs, sensors, and edge devices — no internal CA, no certificate renewal, no PKI infrastructure on the OT network.',
        'SCADA, historian, and DCS connections use continuously rotating symmetric keys instead of static TLS certificates, eliminating expiry-driven outages.',
        'AmeraKey governs encryption keys for historian databases, recipe stores, and IP repositories with deterministic derivation, rotation policies, and audit-ready logs.',
        'All identity and key operations run inside the OT network — no cloud dependency, no external trust chain, no exposure of operational systems.',
      ],
    },
    benefits: [
      {
        label: 'No internal CA or certificate lifecycle',
        desc: 'Eliminates PKI from the factory floor and removes a major operational and security burden.',
      },
      {
        label: 'Hardware-rooted device identity',
        desc: 'Deterministic identity derived from device characteristics — cannot be cloned or extracted.',
      },
      {
        label: 'Auto-rotating transport encryption',
        desc: 'Keys rotate continuously, eliminating silent certificate expiry and reducing lateral-movement risk.',
      },
      {
        label: 'Automated key governance for sensitive data',
        desc: 'AmeraKey manages the full lifecycle of data-at-rest keys for historian, IP, and recipe stores.',
      },
      {
        label: 'IEC 62443-aligned auditability',
        desc: 'Every identity and key event is logged and exportable as compliance evidence.',
      },
    ],
    positioning:
      'Amera secures the modern factory floor with certificate-free device identity and automated key governance — eliminating internal PKI while protecting every PLC, sensor, and operational data store in alignment with IEC 62443.',
  },
  'oil-gas': {
    challenges: [
      'Oil & Gas operations span pipelines, wells, rigs, and refineries distributed across thousands of miles — often in remote, unmanned, or harsh environments where connectivity is intermittent and physical access is limited.',
      'Legacy SCADA and ICS systems still in service were built decades ago with weak or proprietary cryptography, and many field devices cannot support certificate renewal or PKI-based identity.',
      'Telemetry tampering, spoofed commands, and supply-chain compromise pose persistent operational and safety risks.',
      'Cloud-dependent security models fail in offline or intermittently connected environments, and manual key management is impossible to sustain at field scale.',
    ],
    solution: {
      heading: 'Deterministic, Offline-Capable Authentication and Encryption',
      points: [
        'Devices derive keys only when needed, store no long-term secrets, and authenticate each other without certificates or cloud connectivity.',
        'Sensors, PLCs, RTUs, and controllers cryptographically prove identity before any telemetry or command is trusted.',
        'Transport keys rotate continuously and deterministically, eliminating technician dispatches for certificate renewal.',
        'Full security operation continues even when rigs, pumping stations, or remote assets are disconnected for long periods.',
        'AmeraKey manages encryption keys for seismic, geological, and operational datasets with deterministic derivation, rotation, and audit logging.',
      ],
    },
    benefits: [
      {
        label: 'Zero key storage',
        desc: 'Devices store no long-term secrets — nothing to extract, clone, or steal even with physical access.',
      },
      {
        label: 'Deterministic, predictable crypto',
        desc: 'Operations are reproducible and auditable, simplifying compliance and forensic verification.',
      },
      {
        label: 'Offline-capable security',
        desc: 'Works in remote, harsh, or air-gapped environments with no reliance on cloud services or PKI.',
      },
      {
        label: 'Reduced operational overhead',
        desc: 'No certificate renewal, no PKI to maintain, no technician dispatches for key rotation.',
      },
      {
        label: 'Governed data-at-rest encryption',
        desc: 'AmeraKey manages the full lifecycle of keys protecting seismic, telemetry, and operational datasets.',
      },
    ],
    positioning:
      'AmeraKey secures the world’s most distributed Oil & Gas infrastructure with deterministic, offline-capable authentication and encryption — eliminating PKI complexity while protecting every sensor, controller, and field device across the energy lifecycle.',
  },
  utilities: {
    challenges: [
      'Electric utilities operate some of the most complex and reliability-critical OT environments in the world.',
      'Internal SCADA, EMS, and DCS systems often rely on long-lived, manually renewed TLS certificates that silently expire and create exploitable gaps.',
      'Substation remote access and grid-sensor identity depend on internal PKI that OT teams struggle to maintain at scale.',
      'Historian, telemetry, and grid-topology data stores hold sensitive operational information whose encryption keys are frequently managed through manual HSM scripts or spreadsheets.',
      'NERC CIP and IEC 62443 require automated, provable identity and key governance — something manual certificate and key processes cannot deliver.',
    ],
    solution: {
      heading: 'Certificate-Free Grid Device Identity and Automated Key Governance',
      points: [
        'Deterministic, hardware-rooted identity for RTUs, IEDs, relays, and grid sensors — no internal CA, no certificate renewal, and no PKI infrastructure inside the utility network.',
        'Internal OT communications use continuously rotating symmetric keys instead of static TLS certificates, eliminating expiry-driven outages and reducing attack surface.',
        'Short-lived key-based credentials replace certificate-based identity inside remote-access systems, reducing reliance on internal PKI while maintaining NERC CIP-aligned authentication.',
        'AmeraKey governs encryption keys for historian, telemetry, and grid-topology data with deterministic derivation, rotation policies, and audit-ready logs.',
        'All identity and key lifecycle operations run entirely inside the utility’s operational network — no cloud dependency, no external trust chain.',
      ],
    },
    benefits: [
      {
        label: 'No internal CA or certificate lifecycle',
        desc: 'Eliminates PKI from SCADA, EMS, and DCS networks, removing a major operational and security burden.',
      },
      {
        label: 'Hardware-rooted device identity',
        desc: 'Deterministic identity derived from device characteristics — cannot be cloned or extracted.',
      },
      {
        label: 'Auto-rotating transport encryption',
        desc: 'Keys rotate continuously, eliminating silent certificate expiry and reducing lateral-movement risk.',
      },
      {
        label: 'Automated key governance for operational data',
        desc: 'AmeraKey manages the full lifecycle of data-at-rest keys for historian, telemetry, and grid-topology systems.',
      },
      {
        label: 'NERC CIP / IEC 62443-aligned auditability',
        desc: 'Every identity and key event is logged and exportable as compliance evidence.',
      },
    ],
    positioning:
      'Amera secures critical grid infrastructure with certificate-free device identity and automated key governance — eliminating internal PKI while protecting SCADA, EMS, DCS, and operational data in alignment with NERC CIP and IEC 62443.',
  },
  'financial-services': {
    challenges: [
      'Financial institutions operate dense, interconnected systems — trading platforms, risk engines, settlement systems, fraud pipelines, and internal service meshes — all of which depend on large inventories of internally issued certificates.',
      'These certificates expire silently, create operational fragility, and require an internal CA that is costly and difficult to maintain.',
      'Cardholder-data environments (CDEs), tokenization vaults, and backup systems rely on encryption keys often tracked manually in spreadsheets or rotated through ad-hoc HSM scripts.',
      'PCI-DSS requires provable, automated key-lifecycle controls, but manual processes cannot deliver continuous auditability across such a large and dynamic environment.',
    ],
    solution: {
      heading: 'Certificate-Free Service Identity and Audit-Ready Key Governance',
      points: [
        'Deterministic, hardware-rooted identity for internal services and workloads — eliminating internal CA operations and removing certificate renewal from the service mesh.',
        'Internal APIs, gateways, and microservices communicate using continuously rotating symmetric keys instead of static mTLS certificates, reducing outage risk and certificate sprawl.',
        'AmeraKey governs encryption keys for databases, data warehouses, tokenization vaults, and backup systems with deterministic derivation, rotation policies, and audit-ready logs aligned to PCI-DSS 3.5–3.7.',
        'AmeraKey provides deterministic key lifecycle primitives that can be integrated into P2PE, PIN-pad, and payment-gateway key workflows — reducing manual HSM ceremonies without replacing them.',
        'All identity and key operations run entirely inside the financial institution’s private infrastructure — no cloud dependency, no external trust chain.',
      ],
    },
    benefits: [
      {
        label: 'Zero certificate inventory',
        desc: 'Eliminates internal CA operations and removes certificate sprawl across service meshes and API gateways.',
      },
      {
        label: 'Auto-rotating service identity',
        desc: 'Keys rotate continuously, reducing operational risk and eliminating expiry-driven outages.',
      },
      {
        label: 'PCI-aligned key governance',
        desc: 'AmeraKey manages the full lifecycle of data-at-rest keys in alignment with PCI-DSS 3.5–3.7.',
      },
      {
        label: 'Reduced operational overhead',
        desc: 'Fewer manual HSM ceremonies, fewer spreadsheets, and fewer renewal calendars.',
      },
      {
        label: 'Continuous audit readiness',
        desc: 'Every identity and key event is logged and exportable as compliance evidence.',
      },
    ],
    positioning:
      'Amera replaces internal PKI and manual key management across the financial enterprise with certificate-free service identity and automated key governance — securing trading, settlement, and cardholder-data systems in alignment with PCI-DSS.',
  },
  'government-and-defense': {
    challenges: [
      'Classified and national-security environments operate under strict isolation, often inside air-gapped or partially connected networks where cloud-dependent security models and certificate renewal workflows simply cannot function.',
      'Internal PKI is expensive to operate, difficult to maintain inside a classified boundary, and forces fully manual certificate lifecycle management.',
      'Cross-domain workloads rely on fragile trust chains between internal certificate authorities, and classified data-at-rest is frequently governed through manual binders, spreadsheets, or auditor-driven key ceremonies.',
      'Agencies must meet CMMC and ATO requirements — and operate within FIPS-governed environments — with provable, automated identity and key governance that manual processes cannot reliably deliver.',
    ],
    solution: {
      heading:
        'Certificate-Free Machine Identity and Programmatic Key Governance for Classified Environments',
      points: [
        'Deterministic, hardware-rooted identity for systems and workloads inside classified or air-gapped networks — eliminating internal PKI and removing certificate renewal from secure enclaves.',
        'All authentication and encryption operations run locally, with no dependency on cloud services, external trust chains, or online certificate authorities.',
        'Systems authenticate each other using deterministic keys, removing fragile cross-CA trust chains and simplifying secure workload-to-workload communication.',
        'AmeraKey governs encryption keys for classified databases, file stores, and mission systems with deterministic derivation, rotation policies, and audit-ready logs that support CMMC and ATO workflows, and can bolt up to FIPS-certified AES modules where FIPS-validated encryption is mandated.',
        'All identity and key lifecycle operations run entirely inside the classified boundary — no external connectivity, no cloud dependency, no exposure of sensitive systems.',
      ],
    },
    benefits: [
      {
        label: 'No internal CA or certificate lifecycle',
        desc: 'Eliminates PKI from classified and air-gapped networks, reducing operational burden and attack surface.',
      },
      {
        label: 'Offline-capable security',
        desc: 'All identity and encryption operations run locally, with no reliance on cloud or external trust chains.',
      },
      {
        label: 'Deterministic, hardware-rooted identity',
        desc: 'Identity cannot be cloned or extracted, even with physical access.',
      },
      {
        label: 'Programmatic key governance',
        desc: 'AmeraKey manages the full lifecycle of data-at-rest keys for classified systems with deterministic derivation and audit-ready logs.',
      },
      {
        label: 'Supports CMMC and ATO workflows',
        desc: 'Identity and key events are logged and exportable as evidence for accreditation processes, and integrate with FIPS-certified AES modules where FIPS-validated encryption is required.',
      },
    ],
    positioning:
      'Amera delivers certificate-free machine identity and programmatic key governance for classified and air-gapped environments — eliminating internal PKI while enabling secure, offline-capable authentication and encryption aligned with CMMC requirements and deployable within FIPS-governed environments via FIPS-certified AES modules.',
  },
  maritime: {
    challenges: [
      'Maritime operations span vessels, fleets, ports, and terminals that operate with intermittent or unreliable connectivity.',
      'Onboard OT systems — ECDIS, radar, AIS, propulsion control, cargo systems — were built long before modern cybersecurity expectations and often lack strong or consistent cryptography.',
      'Satellite (VSAT) links and port-side OT networks rely on certificates that cannot be renewed reliably at sea or maintained at scale by port operators.',
      'Cargo, manifest, and logistics data must be protected end-to-end and aligned with IMO MSC.428(98) and IACS UR E26/E27 cyber-resilience requirements.',
      'Traditional PKI and cloud-dependent security models simply do not function in these environments.',
    ],
    solution: {
      heading: 'Offline-Capable Onboard Security and Certificate-Free Port Identity',
      points: [
        'AmeraKey provides deterministic, hardware-rooted identity and encryption that works entirely offline — ideal for vessels operating days or weeks without connectivity.',
        'Navigation, propulsion, and onboard control systems authenticate each other before exchanging data, blocking spoofed AIS, GPS, or control messages.',
        'AmeraKey replaces long-lived certificates on satellite links and port networks with continuously rotating symmetric keys — eliminating expiry-driven outages at sea or at the quay.',
        'AmeraKey governs encryption keys for cargo manifests, customs data, and logistics systems with deterministic derivation, rotation policies, and audit-ready logs.',
        'All identity and key lifecycle operations run locally on the vessel or port network — no cloud dependency, no external trust chain.',
      ],
    },
    benefits: [
      {
        label: 'Offline-capable onboard security',
        desc: 'Full authentication and encryption with no reliance on satellite connectivity.',
      },
      {
        label: 'Tamper-proof navigation and control data',
        desc: 'Mutual authentication blocks spoofed AIS, GPS, and ECDIS data before it reaches the bridge.',
      },
      {
        label: 'No certificate renewal at sea or in port',
        desc: 'Auto-rotating symmetric keys eliminate certificate expiry across fleets and port OT networks.',
      },
      {
        label: 'Automated key governance for maritime data',
        desc: 'AmeraKey manages the full lifecycle of keys protecting cargo, manifest, and logistics systems.',
      },
      {
        label: 'IMO / IACS-aligned auditability',
        desc: 'Identity and key events are logged and exportable as evidence for maritime cyber-resilience requirements.',
      },
    ],
    positioning:
      'Amera secures the maritime supply chain from ship to shore with offline-capable authentication and certificate-free identity — protecting navigation, propulsion, cargo, and port systems in alignment with IMO MSC.428(98) and IACS UR E26/E27.',
  },
  'life-sciences-and-healthcare': {
    challenges: [
      'Hospitals, labs, and clinical systems operate across complex networks of EHR platforms, imaging archives, diagnostic equipment, and thousands of connected medical devices.',
      'Most of these systems rely on internal-CA X.509 certificates that cannot be renewed reliably at clinical scale, and certificate expiry can disrupt life-critical workflows.',
      'PHI stored in EHR, DICOM, and HL7/FHIR repositories requires strong encryption and governed key lifecycle, yet many organizations still track keys manually through spreadsheets or ad-hoc HSM scripts.',
      'Regulatory frameworks such as HIPAA and 21 CFR Part 11 demand auditability and controlled access, but manual key management cannot provide consistent, provable governance.',
    ],
    solution: {
      heading: 'Certificate-Free Clinical Device Identity and Compliant Key Governance',
      points: [
        'Deterministic, hardware-rooted identity for infusion pumps, monitors, diagnostic equipment, and other clinical devices — eliminating internal CA operations and certificate renewal cycles.',
        'HL7, FHIR, imaging, and lab-system connections use continuously rotating symmetric keys instead of static TLS certificates, preventing expiry-driven downtime.',
        'AmeraKey governs encryption keys for EHR, DICOM, and FHIR data stores with deterministic derivation, rotation policies, and audit-ready logs that support HIPAA and 21 CFR Part 11 workflows.',
        'Genomic datasets, trial results, and regulatory submissions use policy-driven key rotation and logging to support controlled-access and audit requirements.',
        'All identity and key lifecycle operations run entirely inside the clinical network — no cloud dependency, no external trust chain.',
      ],
    },
    benefits: [
      {
        label: 'No internal CA for medical IoT',
        desc: 'Eliminates certificate issuance and renewal across thousands of clinical devices.',
      },
      {
        label: 'Uninterrupted clinical integrations',
        desc: 'Auto-rotating symmetric keys prevent certificate expiry from disrupting HL7/FHIR workflows.',
      },
      {
        label: 'Governed PHI encryption',
        desc: 'AmeraKey manages the full lifecycle of keys protecting EHR, imaging, and clinical data.',
      },
      {
        label: 'Audit-ready key events',
        desc: 'Identity and key lifecycle events are logged and exportable as evidence for HIPAA and 21 CFR Part 11-aligned processes.',
      },
      {
        label: 'Private-network operation',
        desc: 'All identity and key governance runs inside the clinical network with no cloud dependency.',
      },
    ],
    positioning:
      'Amera protects patient data and connected medical devices with certificate-free identity and automated key governance — securing EHR, imaging, and clinical trial systems in alignment with HIPAA and 21 CFR Part 11 workflows, entirely on the private clinical network.',
  },
  retail: {
    challenges: [
      'Retail environments depend on large, distributed estates of POS terminals, store controllers, kiosks, and back-office systems — all connected over private networks that often rely on internal or payment-brand certificate authorities.',
      'A single missed certificate renewal can take down a checkout lane, disrupt payment processing, or break store-to-controller communication.',
      'Inside the cardholder-data environment (CDE), databases, tokenization vaults, and backup systems require strong encryption and governed key lifecycle, yet many retailers still track keys manually through spreadsheets or ad-hoc HSM scripts.',
      'PCI-DSS 3.5–3.7 demands provable, automated key-lifecycle controls, but manual processes cannot deliver continuous auditability across thousands of stores.',
    ],
    solution: {
      heading: 'Certificate-Free Terminal Identity and Automated Payment Key Governance',
      points: [
        'Deterministic, hardware-rooted identity for POS terminals, kiosks, and store controllers — eliminating internal CA operations and removing certificate renewal from the retail network.',
        'Store-to-controller and controller-to-datacenter connections use continuously rotating symmetric keys instead of static TLS certificates, preventing expiry-driven outages.',
        'AmeraKey governs encryption keys for databases, tokenization vaults, and backup systems with deterministic derivation, rotation policies, and audit-ready logs aligned to PCI-DSS.',
        'AmeraKey provides predictable, governed key rotation that integrates cleanly into tokenization and payment-processing workflows — reducing manual HSM ceremonies without replacing them.',
        'All identity and key lifecycle operations run entirely inside the retailer’s private infrastructure — no cloud dependency, no external trust chain.',
      ],
    },
    benefits: [
      {
        label: 'No internal CA for POS networks',
        desc: 'Eliminates certificate issuance and renewal across thousands of terminals and controllers.',
      },
      {
        label: 'Auto-rotating transport encryption',
        desc: 'Prevents certificate expiry from disrupting checkout lanes or store operations.',
      },
      {
        label: 'PCI-aligned key governance',
        desc: 'AmeraKey manages the full lifecycle of data-at-rest keys inside the CDE.',
      },
      {
        label: 'Reduced operational overhead',
        desc: 'Fewer manual HSM ceremonies, fewer spreadsheets, fewer renewal calendars.',
      },
      {
        label: 'Continuous audit readiness',
        desc: 'Identity and key lifecycle events are logged and exportable as compliance evidence.',
      },
    ],
    positioning:
      'Amera eliminates certificate risk across private POS networks and automates key governance inside the cardholder-data environment — securing terminals, controllers, and payment systems in alignment with PCI-DSS.',
  },
  telecommunications: {
    challenges: [
      'Telecom networks operate at massive scale across the 5G core, transport, and OSS/BSS layers.',
      'The 5G Service-Based Architecture (SBA) mandates TLS between network functions, requiring an internal CA that must issue, track, and renew certificates for dynamically scaled NF instances — a process that is fragile and difficult to automate reliably.',
      'Backhaul and transport links often rely on long-lived certificates that are manually tracked and prone to silent expiry.',
      'The OSS/BSS and management plane — the most privileged internal segment — is typically secured by an internal PKI that operators struggle to maintain.',
      'Subscriber data stores (CDRs, location records, profile databases) require governed encryption keys, yet many carriers still rely on aging HSM scripts or manual processes that cannot scale to carrier workloads.',
    ],
    solution: {
      heading: 'Certificate-Free Network Function Identity and Automated Key Governance',
      points: [
        'Deterministic, hardware-rooted identity for 5G network functions — eliminating internal CA operations and removing certificate renewal from the NF lifecycle.',
        'SBA traffic, backhaul links, and transport connections use continuously rotating symmetric keys instead of static TLS certificates, eliminating expiry-driven outages.',
        'Management-plane systems authenticate using deterministic, hardware-rooted identity, reducing reliance on internal PKI in the most privileged network segment.',
        'AmeraKey governs encryption keys for CDRs, location data, and subscriber profiles with deterministic derivation, rotation policies, and audit-ready logs.',
        'All identity and key lifecycle operations run entirely on carrier infrastructure — no cloud dependency, no external trust chain.',
      ],
    },
    benefits: [
      {
        label: 'No internal CA for 5G NFs',
        desc: 'Eliminates certificate issuance and renewal across dynamically scaled network functions.',
      },
      {
        label: 'Auto-rotating transport encryption',
        desc: 'Prevents certificate expiry from disrupting SBA, backhaul, or transport traffic.',
      },
      {
        label: 'Hardened management plane identity',
        desc: 'Hardware-rooted identity reduces reliance on internal PKI in the most sensitive network segment.',
      },
      {
        label: 'Unified subscriber-data key governance',
        desc: 'AmeraKey manages the full lifecycle of keys protecting CDRs, location data, and subscriber profiles.',
      },
      {
        label: 'Carrier-scale automation',
        desc: 'Identity and key governance operate deterministically at telecom scale with no cloud dependency.',
      },
    ],
    positioning:
      'Amera secures the carrier network from the 5G core to the transport edge with certificate-free network function identity and automated key governance — eliminating internal PKI while protecting subscriber data at carrier scale.',
  },
  transportation: {
    challenges: [
      'Transportation systems span vast, distributed environments — trackside signaling, roadside units, tolling gantries, transit fleets, and connected vehicles — many of which operate in remote locations where connectivity is intermittent and physical access is limited.',
      'Rail signaling, PTC, and traffic-control systems were built decades ago with weak or proprietary cryptography and are rarely patched.',
      'Connected-vehicle and V2X ecosystems must authenticate messages in real time, yet cannot rely on a reachable certificate authority.',
      'ITS networks (traffic controllers, tolling, transit management) depend on internal PKI that operators struggle to maintain at scale.',
      'Regulatory frameworks such as TSA Security Directives, ISO/SAE 21434, and IEC 62443 require provable identity and key governance — something manual certificate and key processes cannot reliably deliver.',
    ],
    solution: {
      heading: 'Offline-Capable OT Authentication and Certificate-Free Vehicle Identity',
      points: [
        'Deterministic, hardware-rooted identity and encryption for signaling, PTC, and control systems — operating entirely offline across remote corridors.',
        'Vehicles, roadside units, and V2X infrastructure authenticate using deterministic, hardware-rooted identity with no dependency on a reachable CA.',
        'Traffic controllers, tolling systems, and transit management move from static certificates to continuously rotating symmetric keys, eliminating expiry-driven outages.',
        'AmeraKey governs encryption keys for fare systems, passenger records, and logistics data with deterministic derivation, rotation policies, and audit-ready logs.',
        'All identity and key lifecycle operations run entirely inside transportation OT networks — no cloud dependency, no external trust chain.',
      ],
    },
    benefits: [
      {
        label: 'Offline-capable OT security',
        desc: 'Full authentication and encryption for signaling and control systems with no reliance on connectivity.',
      },
      {
        label: 'Real-time vehicle and V2X identity',
        desc: 'Hardware-rooted identity enables instant message authentication without a reachable CA.',
      },
      {
        label: 'No internal CA for ITS networks',
        desc: 'Eliminates certificate issuance and renewal across traffic, tolling, and transit systems.',
      },
      {
        label: 'Tamper-proof commands',
        desc: 'Mutual authentication rejects spoofed or replayed signaling and control instructions.',
      },
      {
        label: 'Regulatory-aligned auditability',
        desc: 'Identity and key events are logged and exportable as evidence for TSA, ISO/SAE 21434, and IEC 62443 workflows.',
      },
    ],
    positioning:
      'Amera secures transportation networks from the rail corridor to the connected vehicle with offline-capable OT authentication and certificate-free identity — protecting signaling, traffic control, and passenger data in alignment with TSA, ISO/SAE 21434, and IEC 62443.',
  },
  'information-technology-agentic-ai': {
    challenges: [
      'Autonomous agents now act as non-human identities operating at machine speed and scale — yet most authenticate using static API keys, bearer tokens, or long-lived secrets that can be copied, leaked, or replayed.',
      'Agents call other agents, tools, and APIs continuously, creating a sprawling machine-to-machine attack surface where a single spoofed or hijacked agent can impersonate a trusted one.',
      'Ephemeral workloads spin up and tear down far faster than traditional certificate or secret lifecycles can manage, leaving long-lived credentials lingering in logs, configs, and memory.',
      'Agents routinely access databases, document stores, and model context containing regulated or sensitive data, but rarely operate under governed, least-privilege key access.',
      'Emerging standards — NIST AI RMF, NIST SP 800-207 Zero Trust, OWASP LLM/Agentic Top 10, ISO/IEC 42001, MITRE ATLAS, and the EU AI Act — now expect provable identity, governed key access, and accountability for autonomous systems.',
    ],
    solution: {
      heading: 'Hardware-Rooted Identity and Governed Keys for Autonomous Agents',
      points: [
        'Every agent receives deterministic, hardware-rooted identity — eliminating static API keys and preventing impersonation even if a token leaks.',
        'Agent-to-agent and agent-to-tool calls are cryptographically authenticated on both sides, rejecting spoofed or rogue agents instantly.',
        'Credentials rotate automatically as agents spin up and tear down, eliminating long-lived secrets as standing attack surface.',
        'AmeraKey enforces policy-bound access to encryption keys behind databases, document stores, and model context — ensuring agents only decrypt what they are explicitly authorized to touch.',
        'Every authentication and key operation is logged in a tamper-evident record, supporting NIST AI RMF, ISO/IEC 42001, and EU AI Act readiness.',
        'Keys are never stored locally — even a fully compromised agent host yields nothing to steal, clone, or extract.',
      ],
    },
    benefits: [
      {
        label: 'Verifiable agent identity',
        desc: 'Hardware-rooted identity for every agent — no certificates, no replayable static tokens.',
      },
      {
        label: 'Trusted agent interactions',
        desc: 'Mutual authentication proves both sides on every agent-to-agent and agent-to-tool call.',
      },
      {
        label: 'No standing secrets',
        desc: 'Short-lived, auto-rotating credentials eliminate long-lived secrets from logs and configs.',
      },
      {
        label: 'Least-privilege data access',
        desc: 'Governed key access prevents compromised agents from decrypting beyond their authorization.',
      },
      {
        label: 'Provable accountability',
        desc: 'Tamper-evident logs support NIST AI RMF, ISO/IEC 42001, and EU AI Act workflows.',
      },
    ],
    positioning:
      'Amera secures the agentic era by giving autonomous AI systems hardware-rooted identity, ephemeral credentials, and governed key access — ensuring every agent is verifiable, every interaction is mutually authenticated, and every action is provable against emerging AI security standards.',
  },
  iot: {
    challenges: [
      'IoT deployments span millions of sensors, gateways, and actuators — many constrained, battery-powered, or physically exposed in the field where certificate renewal and PKI are impossible to operate.',
      'Devices frequently authenticate with static keys or factory-burned secrets that can be extracted, cloned, or replayed once a single unit is captured.',
      'Telemetry that drives automation, billing, and safety can be spoofed or tampered with in transit, and many endpoints lack the compute budget for heavyweight cryptography.',
      'Remote and intermittently connected devices cannot rely on a reachable CA or cloud service, yet still require provable identity and governed encryption.',
      'Firmware and OTA update channels are a prime attack vector, and standards such as IEC 62443, ETSI EN 303 645, and NIST IoT guidance now expect provable identity and key governance at scale.',
    ],
    solution: {
      heading: 'Lightweight, Offline-Capable Identity and Key Governance for Connected Devices',
      points: [
        'Deterministic, hardware-rooted identity for every sensor, gateway, and actuator — no internal CA, no certificate renewal, and no PKI infrastructure on the device network.',
        'Lightweight key derivation designed for constrained and battery-powered hardware, replacing heavyweight certificate-based identity.',
        'Devices authenticate and encrypt telemetry at the source, so tampered or spoofed readings are rejected end to end.',
        'Full authentication and encryption run entirely offline, with no dependency on cloud services or external trust chains.',
        'AmeraKey provides deterministic signing primitives for verifying firmware and OTA update integrity, and governs data-at-rest keys with rotation and audit logging.',
      ],
    },
    benefits: [
      {
        label: 'No internal CA or certificate lifecycle',
        desc: 'Eliminates PKI across massive device fleets and removes a major operational burden.',
      },
      {
        label: 'Lightweight, hardware-rooted identity',
        desc: 'Deterministic identity suited to constrained devices — cannot be cloned or extracted.',
      },
      {
        label: 'Offline-capable security',
        desc: 'Works in remote or disconnected deployments with no reliance on cloud or CA services.',
      },
      {
        label: 'Zero key storage on the device',
        desc: 'Keys are regenerated only when needed, so physical capture yields nothing to steal.',
      },
      {
        label: 'Governed firmware and data-at-rest keys',
        desc: 'Deterministic signing and key lifecycle aligned with IEC 62443 and NIST IoT guidance.',
      },
    ],
    positioning:
      'AmeraKey secures the connected device edge with lightweight, offline-capable identity and governed key management — eliminating PKI while protecting every sensor, gateway, and actuator from the field to the cloud.',
  },
};

export default function IndustryUseCasesPage() {
  const params = useParams();
  const slug = (Array.isArray(params?.slug) ? params.slug[0] : params?.slug) || '';

  const meta = industryMeta[slug];
  if (!meta) {
    notFound();
  }

  const { name, image, alt } = meta;
  const useCases = useCasesBySlug[slug] || [];
  const content = industryContentBySlug[slug];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Full-width Image Header */}
      <div className="relative w-full h-72 sm:h-96">
        <Image src={image} alt={alt} fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-[1.9rem] sm:text-[2.55rem] font-bold text-white drop-shadow-lg tracking-tight">
            {name}
          </h1>
        </div>
      </div>

      {/* Black Banner Header */}
      <div className="w-full bg-black py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/industries"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-4 transition-colors duration-200"
          >
            ← Back to Industries
          </Link>
          {useCases.length > 0 && (
            <>
              <h2 className="text-[1.9rem] sm:text-[2.55rem] leading-tight font-bold text-white tracking-tight">
                {name} Use Cases
              </h2>
              <p className="mt-2 text-white/70 text-base">
                Purpose-built capabilities that address the most pressing security and operational
                challenges in {name.toLowerCase()} environments.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Page Content */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 space-y-8">
        {/* Industry Challenge + Solution */}
        {content && (content.challenges || content.solution) && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {content.challenges && (
              <div className="card-on-gray p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-50 text-red-500 shrink-0">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m0 3.75h.008M10.34 3.94l-7.5 12.99A1.5 1.5 0 004.14 19.5h15.72a1.5 1.5 0 001.3-2.57l-7.5-12.99a1.5 1.5 0 00-2.6 0z"
                      />
                    </svg>
                  </span>
                  <h2 className="text-xl font-bold text-gray-900">Industry Challenge</h2>
                </div>
                <ul className="space-y-3.5">
                  {content.challenges.map((c, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-gray-600 text-sm leading-relaxed"
                    >
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                      <span>{tm(c)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {content.solution && (
              <div className="bg-primary/5 rounded-xl border border-primary/15 shadow-sm p-8">
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </span>
                  <h2 className="text-xl font-bold text-gray-900">{tm('Amera Solution')}</h2>
                </div>
                <p className="text-primary font-semibold text-sm mb-6 pl-12">
                  {tm(content.solution.heading)}
                </p>
                <ul className="space-y-3.5">
                  {content.solution.points.map((p, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-gray-700 text-sm leading-relaxed"
                    >
                      <svg
                        className="mt-0.5 w-4 h-4 text-primary shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                      <span>{tm(p)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* Use cases */}
        {useCases.length > 0 && (
          <section>
            {content && (
              <h2 className="text-[1.9rem] sm:text-[2.55rem] leading-tight font-bold text-gray-900 tracking-tight mb-6">
                Use Cases
              </h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {useCases.map((uc, idx) => (
                <div key={idx} className="card-on-gray overflow-hidden flex flex-col">
                  {/* Card top accent */}
                  <div className="h-1 bg-primary w-full" />
                  <div className="p-7 flex flex-col flex-1">
                    {/* Number badge */}
                    <div className="flex items-center gap-3 mb-5">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <div className="h-px flex-1 bg-gray-100" />
                    </div>
                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 leading-snug mb-4">
                      {uc.title}
                    </h3>
                    {/* Body */}
                    <p className="text-gray-600 text-sm leading-relaxed flex-1">{tm(uc.body)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Key Benefits */}
        {content?.benefits && (
          <section>
            <h2 className="text-[1.9rem] sm:text-[2.55rem] leading-tight font-bold text-gray-900 tracking-tight mb-6">
              Key Benefits
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {content.benefits.map((b, i) => (
                <div key={i} className="card-on-gray p-6">
                  <div className="flex items-center gap-2.5 mb-2">
                    <svg
                      className="w-5 h-5 text-primary shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    <p className="font-bold text-gray-900 text-base">{tm(b.label)}</p>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{tm(b.desc)}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Positioning Statement */}
        {content?.positioning && (
          <section>
            <div className="bg-black rounded-2xl px-8 py-12 sm:px-12">
              <p className="text-primary font-semibold text-xs uppercase tracking-widest text-center mb-4">
                Positioning Statement
              </p>
              <p className="text-white text-lg sm:text-2xl font-medium leading-relaxed text-center max-w-4xl mx-auto">
                {tm(content.positioning)}
              </p>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
