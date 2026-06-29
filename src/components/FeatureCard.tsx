'use client';

import React, { useEffect, useState } from 'react';
import { tm } from '@/components/tm';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  summary: string;
  details: string;
}

export default function FeatureCard({ icon, title, summary, details }: FeatureCardProps) {
  const [open, setOpen] = useState(false);
  const detailsId = React.useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <div className="group card-on-gray flex flex-col items-start p-6">
        <div className="card-icon mb-4 h-14 w-14">
          {icon}
        </div>
        <h3 className="text-base font-bold text-gray-900">{tm(title)}</h3>
        <p className="mt-2 text-sm text-gray-600">{tm(summary)}</p>
        <div className="relative mt-auto pt-4 group/learn">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-describedby={detailsId}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
            Learn more
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div
            id={detailsId}
            role="tooltip"
            className="pointer-events-none absolute left-0 top-full z-20 mt-2 w-72 max-w-[calc(100vw-3rem)] translate-y-1 rounded-xl border border-gray-200 bg-white p-4 text-sm leading-relaxed text-gray-600 opacity-0 shadow-xl transition-all duration-200 group-hover/learn:translate-y-0 group-hover/learn:opacity-100 group-focus-within/learn:translate-y-0 group-focus-within/learn:opacity-100">
            {tm(details)}
          </div>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={title}>
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start gap-4 border-b border-gray-100 px-7 pt-7 pb-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 leading-snug pt-1">{tm(title)}</h3>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="ml-auto -mr-1 -mt-1 inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-7 py-6">
              <p className="text-base text-gray-600 leading-relaxed">{tm(details)}</p>
            </div>
            <div className="flex justify-end border-t border-gray-100 px-7 py-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded-lg bg-[#114D8F] hover:bg-[#0E3F75] px-5 py-2 text-sm font-semibold text-white transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
