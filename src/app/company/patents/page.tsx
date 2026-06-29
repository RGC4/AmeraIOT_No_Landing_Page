'use client';

import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import { Reg } from '@/components/tm';

type PatentType = 'Original' | 'Continuation' | 'Continuation in Part';

interface Patent {
  number: string;
  type: PatentType;
  title: string;
  granted?: string;
  pdfUrl?: string;
}

const patents: Patent[] = [
  { number: '11,258,602', type: 'Continuation in Part', granted: 'Feb 22, 2022', title: 'Method and Apparatus for Secure Private Key Storage on IoT Device.', pdfUrl: 'https://patentimages.storage.googleapis.com/2b/0d/b0/cb69549dc3755a/US11258602.pdf' },
  { number: '11,637,698', type: 'Continuation', granted: 'Apr 25, 2023', title: 'Method and Apparatus for Secure Private Key Storage on IoT Device.', pdfUrl: 'https://patentimages.storage.googleapis.com/6a/2b/cd/5dcbf7110f1834/US11637698.pdf' },
  { number: '11,997,202', type: 'Continuation', granted: 'May 28, 2024', title: 'Method and Apparatus for Secure Private Key Storage on IoT Device.', pdfUrl: 'https://patentimages.storage.googleapis.com/d5/13/37/80699a49cadd91/US11997202.pdf' },
  { number: '12,362,928', type: 'Continuation', granted: 'Jul 15, 2025', title: 'Method and Apparatus for Secure Private Key Storage on IoT Device.' },
  { number: '11,256,783', type: 'Continuation in Part', granted: 'Feb 22, 2022', title: 'Method and Apparatus for Simultaneous Key Generation on Device and Server for Secure Communication.', pdfUrl: 'https://patentimages.storage.googleapis.com/20/3c/1a/5eb058849c0376/US11256783.pdf' },
  { number: '11,625,455', type: 'Continuation', granted: 'Apr 11, 2023', title: 'Method and Apparatus for Simultaneous Key Generation on Device and Server for Secure Communication.', pdfUrl: 'https://patentimages.storage.googleapis.com/3f/cd/ff/66d37f9ffa9ea4/US11625455.pdf' },
  { number: '11,983,251', type: 'Continuation', granted: 'May 14, 2024', title: 'Method and Apparatus for Simultaneous Key Generation on Device and Server for Secure Communication.', pdfUrl: 'https://patentimages.storage.googleapis.com/9d/de/bd/0a6351e270a4fb/US11983251.pdf' },
  { number: '12,353,518', type: 'Continuation', granted: 'Jul 8, 2025', title: 'Method and Apparatus for Simultaneous Key Generation on Device and Server for Secure Communication.', pdfUrl: 'https://patentimages.storage.googleapis.com/75/51/0c/e70f08fb67d2ed/US12353518B2.pdf' },
  {
    number: '12,225,125',
    type: 'Continuation in Part',
    granted: 'Feb 11, 2025',
    title:
      'Method and Apparatus for Using a Picture and Shared Secret to Create Replicable High-Quality Pools of Entropy for Keys for Encryption, Authentication and One Time Pads for Images, Data and Message Encoding.',
    pdfUrl: 'https://patentimages.storage.googleapis.com/2a/cd/7b/a98daf3d8e32b9/US12225125.pdf'
  },
  { number: '10,817,590', type: 'Original', granted: 'Oct 27, 2020', title: 'Method and Apparatus for Creating and Using Quantum Resistant Keys.', pdfUrl: 'https://patentimages.storage.googleapis.com/50/a7/90/1b216a77bb12ab/US10817590.pdf' },
  { number: '11,308,183', type: 'Continuation', granted: 'Apr 19, 2022', title: 'Method and Apparatus for Creating and Using Quantum Resistant Keys.', pdfUrl: 'https://patentimages.storage.googleapis.com/21/34/f6/64c5becced7ef8/US11308183.pdf' },
  { number: '11,681,783', type: 'Continuation', granted: 'Jun 20, 2023', title: 'Method and Apparatus for Creating and Using Quantum Resistant Keys.' },
  { number: '12,026,236', type: 'Continuation', granted: 'Jul 2, 2024', title: 'Method and Apparatus for Creating and Using Quantum Resistant Keys.', pdfUrl: 'https://patentimages.storage.googleapis.com/b1/8c/38/adc7ed0624f8ce/US12026236.pdf' },
  { number: '12,547,676', type: 'Continuation', granted: 'Feb 10, 2026', title: 'Method and Apparatus for Creating and Using Quantum Resistant Keys.', pdfUrl: 'https://patents.google.com/patent/US12547676B2/en?oq=12547676' },
  { number: '11,271,911', type: 'Original', granted: 'Mar 8, 2022', title: 'Method and Apparatus for Imprinting Private Key on IoT.', pdfUrl: 'https://drive.google.com/file/d/1350AticoaJiSpWqQqiqP8OkufMrAjyKc/view?usp=sharing' }
];

const totalPatents = patents.length;

function patentUrl(number: string): string {
  return `https://patents.google.com/patent/US${number.replace(/,/g, '')}`;
}

const typeStyles: Record<PatentType, string> = {
  Original: 'bg-primary/10 text-primary',
  Continuation: 'bg-gray-100 text-gray-600',
  'Continuation in Part': 'bg-gray-100 text-gray-600'
};

function PatentCard({ patent }: { patent: Patent }) {
  return (
    <a
      href={patent.pdfUrl ?? patentUrl(patent.number)}
      target="_blank"
      rel="noopener noreferrer"
      className="group card-on-gray p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <span className="text-primary font-semibold text-base leading-tight group-hover:underline">
          U.S. Patent {patent.number}
        </span>
        <span className={`shrink-0 rounded-full border border-[#4D9FD6] px-2.5 py-0.5 text-xs font-medium ${typeStyles[patent.type]}`}>
          {patent.type}
        </span>
      </div>

      <p className="mt-2 text-gray-700 text-sm leading-relaxed flex-1">{patent.title}</p>

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
        {patent.granted ? (
          <span className="inline-flex items-center gap-1.5 text-gray-500">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Granted {patent.granted}
          </span>
        ) : patent.pdfUrl ? (
          <span className="inline-flex items-center gap-1.5 text-gray-500">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            View document
          </span>
        ) : (
          <span />
        )}
        <span className="inline-flex items-center gap-1.5 font-medium text-green-600">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Active
        </span>
      </div>
    </a>
  );
}

export default function PatentsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden text-white">
        <Image
          src="/assets/hero-bg-network.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-white/70">Intellectual Property</p>
          <h1 className="mt-2 text-[1.9rem] sm:text-[2.55rem] leading-tight font-bold tracking-tight">Our Patent Portfolio</h1>
          <p className="mt-4 text-white/90 text-lg leading-relaxed">
            Amera&rsquo;s quantum-proof, transmission-free encryption is protected by a growing
            portfolio of issued and granted U.S. patents, all assigned to Amera IoT, Inc.
          </p>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { value: `${totalPatents}`, label: 'Issued U.S. Patents' },
              { value: 'Active', label: 'Portfolio Status' },
              { value: 'Amera IoT', label: 'Assignee' }
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-4">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="mt-1 text-xs text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Patents */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patents.map((patent) => (
            <PatentCard key={patent.number} patent={patent} />
          ))}
        </div>

        <p className="text-xs text-gray-400 pt-2">
          Patent details are verified against the public records on Google Patents. Select any patent to
          view its full record, claims, and legal status.
        </p>
      </main>

      <Footer />
    </div>
  );
}
