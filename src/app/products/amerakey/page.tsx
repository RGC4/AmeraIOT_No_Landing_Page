'use client';

import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import { Reg, tm } from '@/components/tm';

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="flex h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#114D8F] text-white shadow-sm">
        <svg className="h-[21px] w-[21px] translate-x-[1px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
      <span className="inline-flex items-center rounded-full border border-[#2D74C4] bg-[#F3F9FE] px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#2D74C4] shadow-sm [&_sup]:text-[0.8em] [&_sup]:-ml-[0.1em] [&_sup]:-mr-[0.06em] [&_sup]:tracking-normal">
        {children}
      </span>
    </span>
  );
}

function SectionHead({ eyebrow, title, copy }: { eyebrow?: string; title: string; copy: string }) {
  return (
    <div className="mb-12">
      {eyebrow && <Eyebrow>{tm(eyebrow)}</Eyebrow>}
      <h2 className="text-[1.52rem] sm:text-[2.04rem] font-bold text-gray-900 mt-4 mb-3.5 leading-tight tracking-tight">{tm(title)}</h2>
      <p className="text-lg text-gray-500">{tm(copy)}</p>
    </div>
  );
}

const whatCards = [
  {
    title: 'Zero-Transmission Key Material',
    copy: 'Matching keys are regenerated locally on each trusted endpoint, so key material is never transmitted across the network.',
    icon: <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>
  },
  {
    title: 'Image-Based Entropy Harvesting',
    copy: 'High-entropy key material is harvested from an image combined with a PIN, session value, and selected harvest mode.',
    icon: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.6-3.6a2 2 0 0 0-2.8 0L6 20" /></>
  },
  {
    title: 'Symmetric Crypto Workflows',
    copy: 'Generated keys drive AES-GCM, ChaCha20, and XChaCha20Poly1305 workflows for file and memory encryption and decryption.',
    icon: <><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3" /><circle cx="12" cy="12" r="3" /></>
  }
];

const steps = [
  { n: 1, title: 'Enroll Trusted Material', copy: 'Register the trusted image and PIN material the engine will harvest from.' },
  { n: 2, title: 'Harvest Entropy Locally', copy: 'Derive a high-entropy pool on the endpoint — no transmission required.' },
  { n: 3, title: 'Select Parameters', copy: 'Choose the key index and session parameters for the target workflow.' },
  { n: 4, title: 'Encrypt, Decrypt, Regenerate', copy: 'Run crypto operations or regenerate matching keys on demand.' }
];

const stepLabels = [
  ['harvest', 'mode'], ['key', 'index'], ['session', 'value'],
  ['selected', 'key'], ['entropy', 'pool'], ['ephemeral', 'state']
];

const ppPoints = [
  {
    title: 'Picture + PIN As A Shared Secret',
    copy: 'The picture and PIN act as a pre-shared root — never transmitted, only known to trusted endpoints.',
    icon: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.6-3.6a2 2 0 0 0-2.8 0L6 20" /></>
  },
  {
    title: 'Deterministic Regeneration',
    copy: 'Matching keys are recomputed locally on demand — nothing to intercept, store, or distribute.',
    icon: <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
  },
  {
    title: 'Man-In-The-Middle Nullified',
    copy: 'With no key material crossing the network, there is no key exchange for an attacker to intercept or relay.',
    icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="M8 11l3 3 5-5" /></>
  },
  {
    title: 'A Strategy For Closed Systems',
    copy: 'Ideal for controlled environments where trusted endpoints can be pre-provisioned with shared inputs.',
    icon: <><path d="M12 2 4 5v6c0 5 3.5 8 8 11 4.5-3 8-6 8-11V5Z" /><path d="M12 8v8M8 12h8" /></>
  }
];

const consumeCards = [
  {
    tag: 'Available',
    tagClass: 'text-primary bg-[#EDF5FB] border-[#D2E6F3]',
    title: 'SDK Integration',
    copy: 'Embed AmeraKey through C++, Python, and API-based integration patterns. The SDK supports deterministic key generation, file encryption/decryption, memory-to-memory workflows, IV lifecycle support for memory encryption, and cross-language parity.',
    endpoints: ['C++', 'Python', 'API patterns', 'IV lifecycle', 'cross-language parity']
  },
  {
    tag: 'Optional',
    tagClass: 'text-slate-600 bg-slate-100 border-slate-200',
    title: 'Optional API Service',
    copy: 'Deploy an optional FastAPI service for applications and microservices that prefer a JSON/HTTP interface instead of embedding the SDK directly.',
    endpoints: ['/harvest', '/entropy', '/encrypt', '/decrypt', '/memory-test']
  },
  {
    tag: 'Planned · Q4 2026 GA',
    tagClass: 'text-amber-700 bg-amber-50 border-amber-200',
    title: 'Key Distribution Solution',
    copy: 'A lightweight AmeraKey-based key distribution solution is planned for GA in Q4 2026, supporting client/server communication patterns for controlled environments.',
    endpoints: ['client/server', 'controlled environments']
  }
];

const metrics = [
  { big: '160', unit: 'K', title: 'Keys Per Session', desc: '160,031 unique 256-bit keys from a single 24MP image harvest', tag: '24MP Image' },
  { big: '0.43', unit: 's', title: 'Harvest Time', desc: '40.97 MB entropy pool generated in under half a second', tag: 'PixelXOR Mode' },
  { big: '7.99996', unit: '', title: 'Entropy Score', desc: 'Ideal is 8.0 — AmeraKey achieves statistically indistinguishable randomness', tag: 'Near-Perfect' },
  { big: '300', unit: 'K', title: 'Single Rotation Capacity', desc: 'We generate 300,000 keys from a single 24MP image on a single rotation. The math scales evenly across supported 12MP, 36MP, and 48MP images', tag: '24MP Image' },
  { big: '2\u20134', unit: 'B', title: 'Massive Rotation Scale', desc: 'The system supports 2 billion to 4 billion rotations per image. High-velocity rotation disrupts any attempts at analysis', tag: 'High-Velocity' },
  { big: '1.2', unit: 'Q', title: 'Total Key Pool', desc: 'A single image yields 600 trillion to 1.2 quadrillion unique keys. This provides an unprecedented scale of cryptographic material', tag: 'Per Image' }
];

const useCases = [
  { title: 'Enterprise Services', icon: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></> },
  { title: 'IoT / Device Onboarding', icon: <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M9 9h6v6H9z" /><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" /></> },
  { title: 'Cloud VPC Workloads', icon: <path d="M17.5 19a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.6-1.5A4 4 0 0 0 6 19z" /> },
  { title: 'Secure File Exchange', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></> },
  { title: 'Industrial / Edge Environments', icon: <><path d="m12 14 4-4M3.34 19a10 10 0 1 1 17.32 0" /><path d="M12 2v3M5 12H2M22 12h-3" /></> },
  { title: 'Burst Key Rotation', icon: <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" /> }
];

function Icon({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export default function AmeraKeyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Page Header */}
      <section className="relative bg-primary-dark">
        <Image
          src="/assets/amerakey-hero-unbreakable-v8.png"
          alt="Unbreakable By Design — Discover the future of post-quantum security."
          width={2172}
          height={887}
          priority
          sizes="100vw"
          className="w-full h-auto"
        />
        <p className="absolute left-[4.8%] top-[57.08%] -translate-y-1/2 whitespace-nowrap font-medium tracking-tight text-white/90 [font-size:1.95vw]">
          Discover The Future Of Post-Quantum Encryption
        </p>
      </section>

      {/* HERO */}
      <section className="relative overflow-hidden bg-white -mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-16 lg:pt-2 lg:pb-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-14 items-center">
            <div>
              <h1 className="text-[27.2px] font-bold text-gray-900 mt-6 mb-5 leading-[1.1] tracking-tight">
                Quantum-Proof Key Generation <br /><span className="text-primary">Without Key Transmission</span>
              </h1>
              <p className="text-[12pt] text-gray-600 mb-8">
                AmeraKey<Reg /> harvests high-entropy key material from an image, PIN, session value, and selected harvest
                mode so trusted endpoints can regenerate matching symmetric keys locally — without transmitting key
                material across the network.
              </p>
              <div className="flex flex-wrap gap-3.5">
                <Link href="#consume" className="inline-flex items-center gap-2 bg-[#114D8F] hover:bg-[#0E3F75] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors duration-200">
                  View SDK Options
                </Link>
              </div>
              <div className="flex flex-wrap gap-7 mt-9">
                {[
                  ['Deterministic', 'Matching keys regenerate locally'],
                  ['Caller-Managed', 'No stored metadata, images, or PINs']
                ].map(([b, t]) => (
                  <div key={b} className="text-sm text-gray-500">
                    <b className="block text-[0.95rem] text-gray-900 font-bold">{b}</b>
                    {t}
                  </div>
                ))}
              </div>
            </div>

            <figure className="card-on-white p-3.5 overflow-hidden">
              <Image
                src="/assets/amerakey-diagram.jpg"
                alt="Image + PIN + Session Value feeding the AmeraKey harvest engine to produce symmetric keys"
                width={1320}
                height={880}
                className="w-full h-auto rounded-xl"
                priority
              />
              <figcaption className="mt-6 px-1.5 pb-1 text-center text-[0.675rem] font-semibold leading-relaxed">
                <span className="block text-gray-900">
                  Image + PIN + Session Value (generated by application) &rarr;
                </span>
                <span className="block text-primary">
                  AmeraKey<Reg /> Harvest Engine &rarr; Symmetric Keys
                </span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* WHAT IT IS */}
      <section className="bg-[#DEDEDE] pt-8 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-6">
          {whatCards.map((c) => (
            <div key={c.title} className="card-on-gray p-7">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                <Icon className="w-6 h-6">{c.icon}</Icon>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2.5">{c.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{c.copy}</p>
            </div>
          ))}
        </div>
        <div className="mt-7 rounded-lg bg-[#134C8C] px-6 py-4.5 text-[0.95rem] text-white leading-relaxed">
          <b className="text-white">Note:</b> AmeraKey<Reg /> reduces dependency on public-key key exchange in suitable
          controlled systems. Identity, enrollment, authorization, revocation, and audit still require architecture.
        </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
          <SectionHead
            title="From Trusted Material To Keys On Demand"
            copy="A four-step flow keeps entropy and ephemeral state caller-managed — nothing is stored by the engine."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-9">
            {steps.map((s) => (
              <div key={s.n} className="card-on-white p-6">
                <div className="w-8 h-8 rounded-lg bg-primary text-white font-bold text-sm flex items-center justify-center mb-4">{s.n}</div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.copy}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2.5">
            {stepLabels.map(([k, rest]) => (
              <span key={k} className="text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-full px-3.5 py-2">
                <span className="text-primary font-bold">{k}</span> {rest}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* PICTURE & PIN TECHNOLOGY */}
      <section id="technology" className="scroll-mt-20 bg-[#DEDEDE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <SectionHead
          title="True Randomness, Deterministically Reproduced"
          copy="AmeraKey is a source of true randomness that provides the entropy needed to generate high-quality symmetric keys — yet the same trusted inputs always regenerate the same key, on every authorized endpoint."
        />
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
          <div className="space-y-4 text-[0.97rem] text-gray-700 leading-relaxed">
            <p>
              Like any true random number generator, AmeraKey<Reg /> takes a snapshot of a natural phenomenon — the inherent
              noise in a digital image. To distill that entropy, the engine samples low-order bits from different pixels
              and colors and exclusive-ORs them to produce key data, isolating the sensor and subject noise from the
              ordered signal of the photograph.
            </p>
            <p>
              The pixels being sampled are randomized by a shuffling process driven by the picture data itself and a
              hash of the harvest code, dispersing any local trend between similar pixels. The result is near-perfect
              entropy — and because the process is fully deterministic, an image plus a PIN, session value, and harvest
              mode will always reproduce the identical key wherever those inputs are trusted.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3.5">
            {ppPoints.map((p) => (
              <div key={p.title} className="card-on-gray p-5">
                <h3 className="text-base font-bold text-gray-900 mb-1">{p.title}</h3>
                <p className="text-sm text-gray-500">{p.copy}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center font-bold text-lg sm:text-xl text-gray-900 max-w-3xl mx-auto leading-snug">
          <span className="text-primary">Amera<Reg /></span>-generated keys, passwords, and PINs are almost perfectly random —
          yielding the highest security possible while remaining fully reproducible across trusted endpoints.
        </p>
        </div>
      </section>

      {/* SUPERCHARGING STANDARD CIPHERS */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <SectionHead
          title="A Localized, Offline Key-Derivation Engine"
          copy="AmeraKey draws ephemeral key material from the local entropy pool so industry-standard ciphers run on locally generated resources — never transmitted, never stored."
        />
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center mt-8">
          <figure className="order-1 w-full max-w-xl mx-auto lg:max-w-none">
            <Image
              src="/assets/entropy-pool-engine-v1.png"
              alt="Twin Turbo engine drawing from an Entropy Pool — AmeraKey producing symmetric keys for industry-standard ciphers"
              width={1536}
              height={1024}
              className="w-full h-auto drop-shadow-2xl"
              sizes="(max-width: 1024px) 100vw, 560px"
            />
          </figure>
          <div className="order-2 grid sm:grid-cols-2 gap-5">
            {[
              {
                title: 'Ultimate Key-Derivation',
                copy: 'AmeraKey acts as a localized, offline key-derivation engine for industry-standard ciphers.',
              },
              {
                title: 'Ephemeral Nature',
                copy: 'Keys are drawn directly from the local entropy pool, used for the immediate cryptographic operation, and vanish instantly when the session ends.',
              },
              {
                title: 'Seamless Integration',
                copy: 'AES and ChaChaPoly operate flawlessly using these locally drawn resources.',
              },
              {
                title: 'Key Generation',
                copy: 'AmeraKey can generate in excess of 60,000 keys per second.',
              },
            ].map((c) => (
              <div key={c.title} className="card-on-white p-6">
                <h3 className="text-base font-bold text-gray-900 mb-2.5">{c.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{tm(c.copy)}</p>
              </div>
            ))}
          </div>
        </div>
        </div>
      </section>

      {/* HOW CONSUMED */}
      <section id="consume" className="scroll-mt-20 bg-[#DEDEDE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
          <SectionHead
            title="Three Ways To Integrate"
            copy="Embed the SDK directly, deploy an optional service interface, or adopt the planned key distribution solution."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {consumeCards.map((c) => (
              <div key={c.title} className="card-on-gray p-7 flex flex-col">
                <span className={`self-start text-[0.7rem] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border mb-5 ${c.tagClass}`}>{c.tag}</span>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{c.title}</h3>
                <p className="text-[0.95rem] text-gray-600 mb-5">{tm(c.copy)}</p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {c.endpoints.map((e) => (
                    <span key={e} className="text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">{e}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RECENT DEVELOPMENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <div className="mb-10">
          <h2 className="text-[1.52rem] sm:text-[2.04rem] leading-tight font-bold text-gray-900 mb-4 tracking-tight">
            Speed Meets Near-Perfect Randomness
          </h2>
          <p className="text-base text-gray-600">
            Measured against ideal statistical benchmarks &mdash; AmeraKey<Reg /> entropy is indistinguishable from perfect.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((m) => (
            <div key={m.title} className="card-on-white p-6">
              <div className="font-bold text-[2rem] text-primary leading-none mb-2">
                {m.big}
                <span className="text-[1rem] align-top text-primary/70 ml-0.5">{m.unit}</span>
              </div>
              <h4 className="text-sm font-bold text-gray-900 mb-1.5">{m.title}</h4>
              <p className="text-[0.8rem] text-gray-600 leading-snug mb-3">{tm(m.desc)}</p>
              <span className="inline-block text-[0.65rem] font-bold uppercase tracking-wider text-primary bg-[#EDF5FB] border border-[#D2E6F3] px-2.5 py-0.5 rounded-full">
                {m.tag}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* USE CASES */}
      <section className="bg-[#DEDEDE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
          <SectionHead
            title="Where AmeraKey Fits"
            copy="Controlled systems where local key regeneration and zero transmission are an advantage."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map((u) => (
              <div key={u.title} className="card-on-gray p-6 flex items-center gap-3.5">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="w-5 h-5">{u.icon}</Icon>
                </div>
                <h3 className="text-base font-bold text-gray-900">{u.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
