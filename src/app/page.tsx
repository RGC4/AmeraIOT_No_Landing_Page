'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import SectionCue from '@/components/SectionCue';
import FeatureCard from '@/components/FeatureCard';
import { Reg, tm } from '@/components/tm';

const metrics = [
  { big: '160', unit: 'K', title: 'Keys Per Session', desc: '160,031 unique 256-bit keys from a single 24MP image harvest', tag: '24MP Image' },
  { big: '0.43', unit: 's', title: 'Harvest Time', desc: '40.97 MB entropy pool generated in under half a second', tag: 'PixelXOR Mode' },
  { big: '7.99996', unit: '', title: 'Entropy Score', desc: 'Ideal is 8.0 — AmeraKey achieves statistically indistinguishable randomness', tag: 'Near-Perfect' },
  { big: '300', unit: 'K', title: 'Single Rotation Capacity', desc: 'We generate 300,000 keys from a single 24MP image on a single rotation. The math scales evenly across supported 12MP, 36MP, and 48MP images', tag: '24MP Image' },
  { big: '2\u20134', unit: 'B', title: 'Massive Rotation Scale', desc: 'The system supports 2 billion to 4 billion rotations per image. High-velocity rotation disrupts any attempts at analysis', tag: 'High-Velocity' },
  { big: '1.2', unit: 'Q', title: 'Total Key Pool', desc: 'A single image yields 600 trillion to 1.2 quadrillion unique keys. This provides an unprecedented scale of cryptographic material', tag: 'Per Image' },
];

export default function HomePage() {
  const [heroReady, setHeroReady] = useState(false);
  useEffect(() => { setHeroReady(true); }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden bg-primary-dark">
        {heroReady ? (
          <video
            src="/assets/hero-tidal-wave-final-v2.mp4"
            poster="/assets/hero-tidal-wave-2-v1-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            className="block w-full h-[calc(100vh-230px)] object-cover"
          />
        ) : (
          <Image
            src="/assets/hero-tidal-wave-2-v1-poster.jpg"
            alt=""
            width={1920}
            height={1080}
            priority
            className="block w-full h-[calc(100vh-230px)] object-cover"
          />
        )}
      </section>

      {/* CEO Quote — full-width blue band flush against hero */}
      <section className="relative -mt-px w-screen left-1/2 -translate-x-1/2 bg-[#134C8C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-4 sm:pt-4 sm:pb-5">
          <p className="text-base sm:text-lg italic text-white leading-relaxed">
            &ldquo;In a world racing toward Q-Day, where quantum computers threaten to break traditional
            encryption, AMERA<Reg /> delivers a revolutionary solution: deterministic symmetric keys generated locally
            without ever transmitting material. Neutralize the Man-in-the-Middle, eliminate vulnerable certificates, and
            experience unprecedented speed on standard hardware.&rdquo;{' '}
            <span className="font-bold not-italic">- Gerald Amen, CEO, Amera<Reg /></span>
          </p>
        </div>
      </section>

      {/* Zero-Transmission Paradigm — top-of-page graphic */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Image
          src="/assets/zero-transmission-top-v8.png"
          alt="The Zero-Transmission Paradigm — AmeraKey generates matching symmetric keys locally on each trusted endpoint, so no key material and no ciphertext ever crosses the network. Powering AES & ChaChaPoly without ever sending or storing the key. Zero Transmission: AmeraKey eliminates the key exchange vulnerability entirely; the network layer carries zero cryptographic key material. Local Generation: both endpoints generate identical, highly entropic keys locally, on demand, using a synchronized proprietary engine."
          width={1672}
          height={1019}
          className="block w-full h-auto"
          sizes="(max-width: 1280px) 100vw, 1280px"
          priority
        />
      </section>

      {/* Page Content */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="sr-only">Amera Technologies — Post-Quantum Encryption Platform</h1>
        {/* Hero CTAs */}
        <div className="mb-6 flex justify-center">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center bg-[#114D8F] hover:bg-[#0E3F75] text-white text-sm font-semibold px-6 py-3 rounded-lg transition-colors duration-200">
            Request a Briefing
          </Link>
        </div>

      </main>

      {/* Section 6 — Architectural Advantages */}
      <section className="bg-[#DEDEDE]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">

        {/* Architectural Advantages */}
        <div className="mb-6">
          <div className="mb-4">
            <h2 className="text-[1.9rem] sm:text-[2.55rem] leading-tight font-bold text-gray-900 mb-3 tracking-tight">
              Architectural Advantages
            </h2>
            <SectionCue label="Architecture Overview" bunnyLibraryId="692581" bunnyVideoId="eeb86be0-ed3a-48d7-932b-1bd2e5dd6ee1" title="Architecture Overview" />
            <p className="text-lg text-gray-500">
              Our architecture eliminates the most common attack vectors so you can build and scale with confidence.
            </p>
            <p className="mt-3 text-sm italic text-gray-500 border-l-2 border-gray-300 pl-3">
              AmeraKey<Reg /> suits controlled environments where trusted endpoints can be pre-provisioned with shared
              inputs. Identity, enrollment, authorization, revocation, and audit still require architecture.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              title="Never Send A Key"
              summary="Trusted endpoints regenerate matching symmetric keys locally, so key material is never transmitted across the network."
              details="AmeraKey uses a deterministic key-generation process that runs independently on each trusted endpoint. Because both sides regenerate the same symmetric key locally from shared, pre-established parameters, the key itself never travels across the network. There is no key exchange to intercept, no key in transit to capture, and nothing for a future quantum computer to harvest now and decrypt later — eliminating the single most targeted step in traditional cryptography."
              icon={
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 2 4 5v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V5l-8-3Z" />
                  <circle cx="10.5" cy="11" r="2" />
                  <path d="M12 11h4M14.5 11v2" />
                </svg>
              }
            />

            <FeatureCard
              title="Never Send Ciphertext"
              summary="With no key material or ciphertext exposed in transit, there is nothing for an attacker to intercept, harvest, or replay."
              details="Conventional systems still expose encrypted payloads in transit, giving attackers material to collect for offline analysis, replay, or 'harvest now, decrypt later' attacks. With AmeraKey, only minimal, non-sensitive synchronization data is exchanged — never key material and never the encrypted content an attacker would need. With nothing meaningful on the wire, interception, harvesting, and replay attacks lose their target entirely."
              icon={
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 12.5 3a8.5 8.5 0 0 1 8.5 8.5Z" />
                  <line x1="5" y1="19" x2="19" y2="5" />
                </svg>
              }
            />

            <FeatureCard
              title="Eliminate Certificates"
              summary="Auto-rotating symmetric keys replace long-lived certificates and certificate authorities, removing expiry-driven outages and PKI overhead."
              details="Public Key Infrastructure depends on long-lived certificates, certificate authorities, revocation lists, and expiry management — each one an operational burden and an attack surface. AmeraKey replaces this with auto-rotating symmetric keys that require no central authority and no certificate lifecycle. The result is no expiry-driven outages, no CA-compromise risk, and dramatically less PKI overhead to manage."
              icon={
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5" />
                  <line x1="8" y1="8" x2="12" y2="8" />
                  <line x1="8" y1="12" x2="10.5" y2="12" />
                  <path d="M18 8.5 22 10.4V13c0 2.4-1.6 3.9-4 4.5-2.4-.6-4-2.1-4-4.5v-2.6L18 8.5Z" />
                  <path d="m16.4 12.8 1 1 2-2.1" />
                </svg>
              }
            />
          </div>
        </div>
        </div>
      </section>

      {/* Section 6a2 — Picture In Pin */}
      <section className="bg-white">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2">
          <h3 className="text-[1.9rem] sm:text-[2.55rem] leading-tight font-bold text-gray-900 tracking-tight">
            The Production Pipeline: Harvest &amp; Reap
          </h3>
          <Image
            src="/assets/randomness-pipeline-v1.png"
            alt="High end True Randomness, Deterministically Reproduced — AmeraKey is a source of true randomness that provides the entropy needed to generate high-quality symmetric keys, yet the same trusted inputs always regenerate the same key on every authorized endpoint. A picture and PIN feed sampling, XOR entropy, and shuffling stages to fill an Entropy Pool that produces near-perfect, deterministic key output."
            width={1672}
            height={941}
            className="block mx-auto w-full max-w-[66.24rem] h-auto mt-4"
          />
        </div>
      </section>

      {/* Section 6b — Real-World Benchmarks */}
      <section className="bg-[#DEDEDE]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          <h2 className="text-[1.9rem] sm:text-[2.55rem] leading-tight font-bold text-gray-900 tracking-tight mb-3">
            Speed Meets Near-Perfect Randomness
          </h2>
          <p className="text-lg text-gray-500 mb-8">
            Measured against ideal statistical benchmarks &mdash; AmeraKey<Reg /> entropy is indistinguishable from perfect.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((m) => (
              <div key={m.title} className="card-on-gray p-6">
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
        </div>
      </section>

      {/* Section 7 — Security Architecture Comparison */}
      <section className="bg-white">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">

        {/* Security Architecture Comparison header */}
        <h2 className="text-[1.9rem] sm:text-[2.55rem] leading-tight font-bold text-gray-900 tracking-tight mb-3">
          <span className="block">Legacy Systems Secure The Key In Transit.</span>
          <span className="block">Amera<Reg /> Ensures It Never Enters Transit Or Storage.</span>
        </h2>
        {/* Security Architecture Comparison diagram */}
        <div className="mb-6 mx-auto w-[94.8%]">
          <Image
            src="/assets/security-architecture-comparison-banner-v8.png"
            alt="Security Architecture Comparison — Legacy PKI / key exchange transmits keys via TLS/network, stores them in KMS/databases, and is vulnerable to man-in-the-middle and vault/server breach threats. AmeraKey architecture uses zero transmission (locally generated), zero storage (ephemeral/vanishing), makes man-in-the-middle impossible (only distances sent), and neutralizes breach threats (no keys exist at rest). Legacy systems secure the transport of the key; AmeraKey ensures the key never enters transport or storage."
            width={1101}
            height={612}
            className="h-auto w-full"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
        </div>
        </div>
      </section>

      <Footer />
    </div>);
}
