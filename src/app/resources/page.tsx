'use client';

import React from 'react';
import Header from '@/components/Header';
import Image from 'next/image';
import Footer from '@/components/Footer';

export default function ResourcesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Hero */}
      <section className="bg-primary-dark">
        <Image
          src="/assets/resources-hero-learn-v7.png"
          alt="Learn About Amera — Building your quantum defense architecture."
          width={1482}
          height={494}
          priority
          quality={100}
          sizes="100vw"
          className="w-full h-auto"
        />
      </section>

      {/* Document library */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <h1 className="text-[1.9rem] sm:text-[2.55rem] leading-tight font-bold text-gray-900 tracking-tight mb-8">Amera White Papers</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { i: 1, src: '/assets/whitepaper-quantum-proof-v4.png', w: 557, h: 680, alt: 'AmeraKey Quantum-Proof Encryption', href: '/assets/whitepaper-quantum-proof.pdf' },
            { i: 2, src: '/assets/whitepaper-pki-wrong-bet-v6.png', w: 557, h: 680, alt: 'Why PKI Is the Wrong Bet for the Post-Quantum Era', href: '/assets/whitepaper-pki-wrong-bet.pdf' },
            { i: 3, src: '/assets/whitepaper-iot-security-v4.png', w: 557, h: 680, alt: 'AmeraKey Introducing True IoT Security', href: '/assets/whitepaper-iot-security.pdf' },
            { i: 4, src: '/assets/whitepaper-controlled-qkd-v7.png', w: 557, h: 680, alt: 'AmeraKey Controlled Quantum Key Distribution — Breaking the Shackles of PKI', href: '/assets/whitepaper-controlled-qkd.pdf' },
          ].map(({ i, src, w, h, alt, href }) => {
            const card = (
              <Image
                src={src}
                alt={alt}
                width={w}
                height={h}
                quality={100}
                sizes="(min-width: 1024px) 384px, (min-width: 640px) 45vw, 90vw"
                className="w-full h-auto object-contain rounded-sm border border-[#36454F] shadow-md transition-all duration-200 ease-out group-hover:-translate-y-0.5 group-hover:shadow-lg"
              />
            );
            const cardClass = 'group block';
            return href ? (
              <a key={i} href={href} target="_blank" rel="noopener noreferrer" className={cardClass}>
                {card}
              </a>
            ) : (
              <div key={i} className={cardClass}>
                {card}
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>);
}
