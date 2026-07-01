'use client';

import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import { Reg, tm } from '@/components/tm';

const problemSolutions: string[] = [
  'AmeraKey® provides quantum-proof symmetric keys with key lengths up to 4096 bits.',
  'Our keys are never sent, stored or exposed.',
  'AmeraKey® solves the problem of synchronizing keys across multiple remote locations.',
  'AmeraKey® provides a large, near-instantaneous entropy pool that allows keys to be changed on-the-fly.',
  'AmeraKey® eliminates passwords as a method for key generation, sharply reducing the efficacy of phishing and credential-theft attacks.',
  'AmeraKey® is a frictionless solution for securing both data in-transit and data-at rest.',
  'Amera® technology facilitates the implementation of a true Zero Trust Environment.',
];

export default function VisionAndMissionPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Hero band */}
      <section className="relative overflow-hidden bg-primary-dark">
        <Image
          src="/assets/hero-bg-clouds.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <p className="text-white/70 text-sm font-semibold tracking-[2px] uppercase">About Us</p>
          <h1 className="mt-3 text-[1.9rem] sm:text-[2.55rem] font-bold text-white tracking-tight">
            Vision and Mission
          </h1>
          <p className="mt-4 text-white/85 text-base sm:text-lg leading-relaxed lg:whitespace-nowrap">
            Redefining Crypto Agility For The Quantum Age.
          </p>
        </div>
      </section>

      {/* Vision & Mission */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-on-gray p-8">
            <h2 className="text-2xl font-bold text-gray-900">Our Vision</h2>
            <div className="mt-3 h-1 w-12 rounded-full bg-primary" />
            <p className="mt-5 text-gray-800 text-lg font-medium leading-relaxed">
              To redefine digital trust through deterministic, zero-transmission cryptography,
              eliminating the vulnerabilities of legacy key management and protecting critical
              infrastructure for the post-quantum era.
            </p>
          </div>

          <div className="card-on-gray p-8">
            <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
            <div className="mt-3 h-1 w-12 rounded-full bg-primary" />
            <p className="mt-5 text-gray-800 text-lg font-medium leading-relaxed">
              To drive global crypto-agility by providing a frictionless, certificate-free path to
              quantum-safe security, ensuring operational resilience against the collision of AI and
              quantum computing.
            </p>
          </div>
        </div>

        {/* Problems and Solutions */}
        <section className="mt-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {problemSolutions.map((item, idx) => (
              <div
                key={idx}
                className={`card-on-gray p-6 flex gap-4${
                  idx === problemSolutions.length - 1 ? ' lg:col-start-2' : ''
                }`}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                  {idx + 1}
                </div>
                <p className="text-gray-600 leading-relaxed">{tm(item)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="mt-14">
          <div className="rounded-2xl bg-brand px-8 py-12 text-center">
            <p className="text-white/70 text-sm font-semibold tracking-[2px] uppercase">
              Let&rsquo;s get in touch
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-white">
              Contact us to learn what AmeraKey
              <Reg /> can do for you.
            </h2>
            <Link
              href="/contact"
              className="mt-7 inline-flex items-center gap-2 bg-white text-primary hover:bg-gray-100 text-sm font-semibold px-7 py-3 rounded-lg transition-colors duration-200 shadow-lg"
            >
              Get in Touch
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
