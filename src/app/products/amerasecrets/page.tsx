'use client';

import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import { Reg, tm } from '@/components/tm';

function Eyebrow({
  children,
  variant = 'primary',
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'green';
}) {
  const circleBg = variant === 'green' ? 'bg-emerald-700' : 'bg-[#114D8F]';
  const pillStyles =
    variant === 'green'
      ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
      : 'text-[#2D74C4] bg-[#F3F9FE] border-[#2D74C4]';
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={`flex h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-full text-white shadow-sm ${circleBg}`}
      >
        <svg
          className="h-3.5 w-3.5 translate-x-[1px]"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
      <span
        className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.08em] shadow-sm [&_sup]:text-[0.8em] [&_sup]:-ml-[0.1em] [&_sup]:-mr-[0.06em] [&_sup]:tracking-normal ${pillStyles}`}
      >
        {children}
      </span>
    </span>
  );
}

function SectionHead({
  eyebrow,
  title,
  copy,
  center,
  variant = 'primary',
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  center?: boolean;
  variant?: 'primary' | 'green';
}) {
  return (
    <div className={`mb-12 ${center ? 'mx-auto text-center' : ''}`}>
      <Eyebrow variant={variant}>{tm(eyebrow)}</Eyebrow>
      <h2 className="text-[1.9rem] sm:text-[2.55rem] font-bold text-gray-900 mt-4 mb-3.5 leading-tight tracking-tight">
        {tm(title)}
      </h2>
      {copy && <p className="text-lg text-gray-500">{tm(copy)}</p>}
    </div>
  );
}

function Icon({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

const heroMeta = [
  ['Unified governance', 'Secrets, keys & policies in one plane'],
  ['Automated lifecycle', 'Rotation, audit & enforcement'],
  ['Cloud + hybrid + edge', 'Consistent everywhere'],
];

const whatCards = [
  {
    title: 'Centralized Secrets Governance',
    copy: 'Manage application secrets, encryption keys, credentials, and cryptographic policies from a unified platform designed for modern infrastructure.',
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3a9 9 0 0 0 0 18M3 12h18" />
      </>
    ),
  },
  {
    title: 'Deterministic Key Operations',
    copy: 'Generate and regenerate cryptographic material on demand while reducing operational dependence on traditional key distribution workflows.',
    icon: (
      <path d="m21 2-2 2m-7.6 7.6a5.5 5.5 0 1 1-7.8 7.8 5.5 5.5 0 0 1 7.8-7.8Zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3" />
    ),
  },
  {
    title: 'Enterprise Lifecycle Control',
    copy: 'Automate rotation, access controls, audit visibility, and policy enforcement across cloud, hybrid, and edge environments.',
    icon: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  },
];

const tradList = [
  'Secret sprawl',
  'Hardcoded credentials',
  'Manual rotation',
  'Multiple vaults',
  'Complex key distribution',
  'Certificate lifecycle issues',
  'Operational overhead',
];

const ameraList = [
  'Centralized governance',
  'Automated rotation',
  'Policy-driven access',
  'Application integration',
  'Deterministic key operations',
  'Reduced operational complexity',
  'Unified visibility',
];

const steps = [
  { n: 1, title: 'Define Policy', copy: 'Set access, rotation, and compliance rules.' },
  { n: 2, title: 'Register Application', copy: 'Onboard apps, services, and workloads.' },
  { n: 3, title: 'Issue Secrets & Keys', copy: 'Provision cryptographic material on demand.' },
  { n: 4, title: 'Rotate & Audit', copy: 'Automate rotation with full event visibility.' },
  { n: 5, title: 'Scale Across Infrastructure', copy: 'Extend consistently to every environment.' },
];

const capabilities = [
  {
    title: 'Secrets Management',
    copy: 'Store, retrieve, govern, and rotate application secrets.',
    icon: (
      <>
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </>
    ),
  },
  {
    title: 'Key Lifecycle Management',
    copy: 'Manage generation, rotation, expiration policies, and cryptographic workflows.',
    icon: (
      <>
        <circle cx="8" cy="8" r="5" />
        <path d="m13 11 8 8M16 16l3-3M19 19l2-2" />
      </>
    ),
  },
  {
    title: 'Application Integration',
    copy: 'Support APIs, SDKs, microservices, containers, and enterprise applications.',
    icon: <path d="M16 18 22 12 16 6M8 6 2 12 8 18" />,
  },
  {
    title: 'Policy & Governance',
    copy: 'Role-based controls, approval workflows, compliance controls, and operational guardrails.',
    icon: (
      <>
        <path d="M12 2 4 5v6c0 5 3.5 8 8 11 4.5-3 8-6 8-11V5Z" />
        <path d="M9 12h6M12 9v6" />
      </>
    ),
  },
  {
    title: 'Audit & Visibility',
    copy: 'Track usage, lifecycle events, access requests, and rotation activity.',
    icon: (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
  },
  {
    title: 'Hybrid & Multi-Cloud',
    copy: 'Operate consistently across private cloud, public cloud, on-premises, and edge environments.',
    icon: <path d="M17.5 19a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.6-1.5A4 4 0 0 0 6 19zM9 13l2 2 4-4" />,
  },
];

const deployments = [
  {
    title: 'Enterprise Data Center',
    copy: 'Run fully on-premises with complete operational ownership and control.',
    icon: (
      <>
        <rect x="3" y="4" width="18" height="6" rx="1" />
        <rect x="3" y="14" width="18" height="6" rx="1" />
        <path d="M7 7h.01M7 17h.01" />
      </>
    ),
  },
  {
    title: 'Cloud Native',
    copy: 'Deploy as a managed, elastic service across public cloud platforms.',
    icon: <path d="M17.5 19a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.6-1.5A4 4 0 0 0 6 19z" />,
  },
  {
    title: 'Hybrid Infrastructure',
    copy: 'Bridge on-premises and cloud with one consistent control plane.',
    icon: (
      <>
        <circle cx="6" cy="6" r="3" />
        <circle cx="18" cy="18" r="3" />
        <path d="M9 6h6a3 3 0 0 1 3 3v6M6 9v6a3 3 0 0 0 3 3h6" />
      </>
    ),
  },
  {
    title: 'Air-Gapped / High Security',
    copy: 'Operate in isolated, high-assurance environments with no external dependency.',
    icon: (
      <>
        <path d="M12 2 4 5v6c0 5 3.5 8 8 11 4.5-3 8-6 8-11V5Z" />
        <path d="M8 12h8" />
      </>
    ),
  },
];

const tiles = [
  {
    title: 'Financial Services',
    copy: 'Protect transactions, credentials, and regulated data at scale.',
    grad: 'from-[#1f3a6e] to-[#2f6fed]',
    icon: <path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6" />,
  },
  {
    title: 'Healthcare',
    copy: 'Safeguard patient records and meet strict compliance mandates.',
    grad: 'from-[#155c39] to-[#1f9a63]',
    icon: <path d="M11 2v4M9 4h4M12 6v4M4 22V12a8 8 0 0 1 16 0v10M8 22v-5h8v5" />,
  },
  {
    title: 'Manufacturing',
    copy: 'Secure connected production systems and industrial workloads.',
    grad: 'from-[#3a3f4a] to-[#6b7280]',
    icon: <path d="M2 20h20M4 20V8l5-3v15M9 20V5l6 3v12M15 20V8l5 3v9" />,
  },
  {
    title: 'Government & Defense',
    copy: 'Meet high-assurance requirements in sensitive environments.',
    grad: 'from-[#1a2738] to-[#324a63]',
    icon: <path d="M12 2 4 5v6c0 5 3.5 8 8 11 4.5-3 8-6 8-11V5Z" />,
  },
  {
    title: 'Critical Infrastructure',
    copy: 'Defend energy, utilities, and essential service operations.',
    grad: 'from-[#5a3210] to-[#a8702e]',
    icon: (
      <path d="M3 9h18M3 15h18M7 9v6M17 9v6M5 21h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z" />
    ),
  },
  {
    title: 'Cloud Platforms',
    copy: 'Embed governed cryptographic operations into cloud services.',
    grad: 'from-[#1c2f63] to-[#3b6ad6]',
    icon: <path d="M17.5 19a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.6-1.5A4 4 0 0 0 6 19z" />,
  },
];

const whyCards = [
  { title: 'Reduce Secret Sprawl', icon: <path d="M3 6h18M7 12h10M10 18h4" /> },
  {
    title: 'Automate Rotation',
    icon: <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />,
  },
  {
    title: 'Improve Audit Readiness',
    icon: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M9 15l2 2 4-4" />
      </>
    ),
  },
  {
    title: 'Support Hybrid Deployments',
    icon: <path d="M17.5 19a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.6-1.5A4 4 0 0 0 6 19z" />,
  },
  { title: 'Scale Cryptographic Operations', icon: <path d="M3 3v18h18M7 14l4-4 3 3 5-6" /> },
  {
    title: 'Strengthen Operational Resilience',
    icon: <path d="M12 2 4 5v6c0 5 3.5 8 8 11 4.5-3 8-6 8-11V5Z" />,
  },
];

export default function AmeraSecretsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/[0.06] via-white to-primary/[0.05]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div>
            <div>
              <Eyebrow>
                AmeraSecrets
                <Reg /> Platform
              </Eyebrow>
              <h1 className="text-[1.9rem] sm:text-[2.55rem] font-bold text-gray-900 mt-5 mb-5 leading-[1.1] tracking-tight">
                Enterprise Secrets Management{' '}
                <span className="text-primary">Without Traditional Key Distribution</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                AmeraSecrets
                <Reg /> combines deterministic key generation, automated secret lifecycle
                management, and enterprise policy controls into a unified platform for modern
                applications, cloud services, and connected infrastructure.
              </p>
              <div className="flex flex-wrap gap-3.5">
                <Link
                  href="#contact"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-bold px-6 py-3.5 rounded-xl transition-colors shadow-sm"
                >
                  Request Demo
                </Link>
                <Link
                  href="#how"
                  className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-primary text-gray-900 hover:text-primary text-sm font-bold px-6 py-3.5 rounded-xl transition-colors"
                >
                  View Architecture
                </Link>
              </div>
              <div className="flex flex-wrap gap-7 mt-9">
                {heroMeta.map(([b, t]) => (
                  <div key={b} className="text-sm text-gray-500">
                    <b className="block text-[0.95rem] text-gray-900 font-bold">{b}</b>
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT IS IT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <SectionHead
          eyebrow="What Is AmeraSecrets?"
          title="A Unified Platform For Secrets, Keys, And Policy"
          copy="Built around Amera's deterministic key generation, AmeraSecrets brings cryptographic operations and secret lifecycle under one control plane."
        />
        <div className="grid md:grid-cols-3 gap-6">
          {whatCards.map((c) => (
            <div key={c.title} className="card-on-white p-7">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                <Icon className="w-6 h-6">{c.icon}</Icon>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2.5">{c.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{c.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ARCHITECTURE DIAGRAM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <figure className="max-w-4xl mx-auto card-on-white p-3.5 overflow-hidden">
          <Image
            src="/assets/amerasecrets-diagram.png"
            alt="Applications, containers, cloud services and edge devices connecting to the AmeraSecrets control plane"
            width={1448}
            height={1086}
            className="w-full h-auto rounded-xl"
          />
          <figcaption className="mt-3.5 px-1.5 pb-1 text-center text-xs font-semibold text-gray-500 leading-relaxed">
            Applications, Containers, Cloud Services &amp; Edge Devices → AmeraSecrets
            <Reg /> Control Plane → powered by Amera
            <Reg /> technology
          </figcaption>
        </figure>
      </section>

      {/* PROBLEM / COMPARISON */}
      <section id="problem" className="bg-[#DEDEDE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
          <SectionHead
            eyebrow="The Problem We Solve"
            title="From Scattered Complexity To A Single Control Layer"
            copy="Most organizations manage secrets across fragmented tools and manual processes. AmeraSecrets collapses that sprawl into one governed plane."
          />
          <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-6 items-stretch">
            <div className="bg-white border border-gray-200 border-t-[3px] border-t-rose-600 rounded-2xl shadow-sm p-7">
              <h3 className="text-[1.05rem] font-bold text-gray-900 mb-4 flex items-center gap-2.5">
                Traditional Environment
                <span className="text-[0.65rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-rose-700 bg-rose-50">
                  Today
                </span>
              </h3>
              <ul>
                {tradList.map((item, i) => (
                  <li
                    key={item}
                    className={`text-sm text-gray-700 py-2.5 pl-7 relative ${i < tradList.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    <span className="absolute left-0 top-2.5 font-extrabold text-rose-600">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="hidden lg:flex items-center justify-center text-gray-400">
              <Icon className="w-8 h-8">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </Icon>
            </div>
            <div className="bg-white border border-gray-200 border-t-[3px] border-t-primary rounded-2xl shadow-sm p-7">
              <h3 className="text-[1.05rem] font-bold text-gray-900 mb-4 flex items-center gap-2.5">
                AmeraSecrets
                <Reg /> Environment
                <span className="text-[0.65rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-primary bg-[#EDF5FB] border border-[#D2E6F3]">
                  Unified
                </span>
              </h3>
              <ul>
                {ameraList.map((item, i) => (
                  <li
                    key={item}
                    className={`text-sm text-gray-700 py-2.5 pl-7 relative ${i < ameraList.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    <span className="absolute left-0 top-2.5 font-extrabold text-primary">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <SectionHead eyebrow="How AmeraSecrets Works" title="Govern Centrally, Deploy Anywhere" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-7">
          {steps.map((s) => (
            <div key={s.n} className="card-on-white p-6">
              <div className="w-7 h-7 rounded-lg bg-primary text-white font-bold text-xs flex items-center justify-center mb-3.5">
                {s.n}
              </div>
              <h3 className="text-[0.95rem] font-bold text-gray-900 mb-1.5">{s.title}</h3>
              <p className="text-[0.8rem] text-gray-500">{s.copy}</p>
            </div>
          ))}
        </div>
        <div className="max-w-3xl bg-gray-50 border border-gray-200 border-l-[3px] border-l-primary rounded-xl px-5 py-4 text-[0.95rem] text-gray-700">
          AmeraSecrets
          <Reg /> separates cryptographic operations from application workflows, enabling
          centralized governance while supporting distributed deployment models.
        </div>
      </section>

      {/* CAPABILITIES */}
      <section id="capabilities" className="bg-[#DEDEDE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
          <SectionHead
            eyebrow="Platform Capabilities"
            title="Everything Secrets And Keys Require"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {capabilities.map((c) => (
              <div key={c.title} className="card-on-gray p-7">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6">{c.icon}</Icon>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2.5">{c.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{c.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPLOYMENT */}
      <section id="deployment" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <SectionHead eyebrow="Deployment Models" title="Deploy On Your Terms" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {deployments.map((d) => (
            <div key={d.title} className="card-on-white p-7">
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Icon className="w-5 h-5">{d.icon}</Icon>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{d.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{d.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* USE CASES */}
      <section id="usecases" className="bg-[#DEDEDE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
          <SectionHead
            eyebrow="Key Use Cases"
            title="Trusted Across Regulated Industries"
            copy="Organizations with the highest security and compliance demands rely on unified cryptographic governance."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tiles.map((t) => (
              <div
                key={t.title}
                className={`relative h-56 rounded-2xl overflow-hidden border border-gray-200 flex items-end p-6 text-white bg-gradient-to-br ${t.grad}`}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/70" />
                <div className="absolute top-5 left-5 z-10 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                  <Icon className="w-5 h-5">{t.icon}</Icon>
                </div>
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-white mb-1">{t.title}</h3>
                  <p className="text-[0.8rem] text-white/80">{t.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <SectionHead
          eyebrow="Why Organizations Choose AmeraSecrets"
          title="Outcomes That Matter To The Enterprise"
          center
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-9">
          {whyCards.map((w) => (
            <div key={w.title} className="card-on-white p-6 flex items-center gap-3.5">
              <div className="shrink-0 w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Icon className="w-5 h-5">{w.icon}</Icon>
              </div>
              <h3 className="text-[0.97rem] font-bold text-gray-900">{w.title}</h3>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <p className="max-w-3xl text-center text-base text-gray-700 bg-gray-50 border border-gray-200 rounded-2xl px-7 py-6">
            AmeraSecrets
            <Reg /> is designed to help organizations modernize cryptographic operations while
            simplifying the management of secrets, policies, and application security at scale.
          </p>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section
        id="contact"
        className="scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20"
      >
        <div className="relative overflow-hidden rounded-3xl px-8 sm:px-12 py-16 text-center bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:26px_26px]" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-primary/20 border border-primary/40 text-primary-light">
              Get Started
            </span>
            <h2 className="text-white text-[1.9rem] sm:text-[2.55rem] font-bold mt-4 mb-3.5 leading-tight tracking-tight">
              Bring Cryptographic Operations Under Control
            </h2>
            <p className="text-white/70 max-w-lg mx-auto mb-7 text-base">
              Unify secrets management, lifecycle automation, and deterministic cryptographic
              operations within a single enterprise platform.
            </p>
            <div className="flex flex-wrap gap-3.5 justify-center">
              <Link
                href="/company"
                className="inline-flex items-center gap-2 bg-white text-gray-900 hover:bg-primary/10 hover:text-primary-dark text-sm font-bold px-6 py-3.5 rounded-xl transition-colors"
              >
                Request Demo
              </Link>
              <Link
                href="/resources"
                className="inline-flex items-center gap-2 bg-transparent border border-white/30 hover:border-white text-white text-sm font-bold px-6 py-3.5 rounded-xl transition-colors"
              >
                Speak With an Architect
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
