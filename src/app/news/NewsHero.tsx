'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Reg } from '@/components/tm';

export default function NewsHero() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <section className="relative overflow-hidden bg-primary-dark">
      {ready ? (
        <video
          src="/assets/news-hero.mp4"
          poster="/assets/hero-poster.jpg"
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <Image
          src="/assets/hero-poster.jpg"
          alt=""
          width={1280}
          height={720}
          priority
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <p className="text-white/70 text-sm font-semibold tracking-[2px] uppercase">
          Signals &amp; Analysis
        </p>
        <h1 className="mt-2 text-6xl font-bold text-white tracking-tight">News</h1>
        <p className="mt-4 text-white/85 text-base sm:text-lg leading-relaxed">
          A live feed of the latest cybersecurity, quantum, and IoT-security developments shaping
          why Amera
          <Reg />
          &rsquo;s approach matters now.
        </p>
      </div>
    </section>
  );
}
