'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import { Reg, tm } from '@/components/tm';

import { executives, type Executive } from './executives';

function ExecutiveCard({ exec }: { exec: Executive }) {
  const [open, setOpen] = useState(false);
  const paragraphs = exec.bio ? exec.bio.split('\n\n').map((p) => p.trim()).filter(Boolean) : [];
  const firstParagraph = paragraphs[0] ?? '';
  const hasMore = paragraphs.length > 1 || firstParagraph.length > 170;
  const preview =
    firstParagraph.length > 170 ? `${firstParagraph.slice(0, 170).trimEnd()}\u2026` : firstParagraph;

  return (
    <div className="card-on-gray overflow-hidden flex flex-col">
      {/* Avatar banner */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
        {exec.image && (
          <Image
            src={exec.image}
            alt={`Portrait of ${exec.name}`}
            fill
            className={`object-cover ${exec.imagePosition ?? 'object-top'}`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}
      </div>

      {/* Details */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-semibold text-gray-900 leading-tight">{exec.name}</h3>
        <p className="mt-1 text-primary text-sm font-medium">{exec.title}</p>

        {exec.bio && (
          <div className="mt-3 text-gray-600 text-sm leading-relaxed space-y-3">
            {open ? (
              paragraphs.map((paragraph, idx) => <p key={idx}>{tm(paragraph)}</p>)
            ) : (
              <p>{tm(preview)}</p>
            )}
          </div>
        )}

        {hasMore && (
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            className="mt-4 self-start text-primary text-sm font-semibold hover:underline inline-flex items-center gap-1">
            {open ? 'Show Less' : 'Learn More'}
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default function ExecutiveTeamPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Page Content */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <div className="mb-10 max-w-[61rem] mx-auto">
          <h1 className="text-[1.9rem] sm:text-[2.55rem] leading-tight font-bold text-gray-900 tracking-tight">Executive Team</h1>
          <p className="mt-2 text-gray-500 text-lg">
            Meet the leaders driving Amera<Reg />&rsquo;s mission to deliver frictionless, quantum-proof security.
          </p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {executives.map((exec) => (
            <ExecutiveCard key={exec.name} exec={exec} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
