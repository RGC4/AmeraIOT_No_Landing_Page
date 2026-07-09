'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';

interface Industry {
  name: string;
  image: string;
  alt: string;
}

const industries: Industry[] = [
  {
    name: 'Manufacturing',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_12e0ea91d-1766522162099.png',
    alt: 'Large industrial manufacturing plant with heavy machinery and assembly lines',
  },
  {
    name: 'Oil & Gas',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_17a45d586-1773792708028.png',
    alt: 'Offshore oil drilling platform surrounded by ocean at dusk',
  },
  {
    name: 'Utilities',
    image: 'https://images.unsplash.com/photo-1606836287764-838853d78eda',
    alt: 'High voltage electrical power transmission towers and lines at sunset',
  },
  {
    name: 'Financial Services',
    image: 'https://images.unsplash.com/photo-1648587096714-170302c4c922',
    alt: 'Modern financial district with glass skyscrapers reflecting city lights',
  },
  {
    name: 'Government and Defense',
    image: 'https://images.unsplash.com/photo-1627738802542-62cbc6998707',
    alt: 'Stately government building with columns and national flag flying',
  },
  {
    name: 'Maritime',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1ca75ea7f-1768420463955.png',
    alt: 'Large cargo container ship sailing through open ocean waters',
  },
  {
    name: 'Life Sciences and Healthcare',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_186a3ceaf-1777282013156.png',
    alt: 'Medical researcher in laboratory examining samples under microscope',
  },
  {
    name: 'Retail',
    image: 'https://images.unsplash.com/photo-1612093764919-d6b04df76e0b',
    alt: 'Busy modern retail shopping mall with multiple store fronts and shoppers',
  },
  {
    name: 'Telecommunications',
    image: 'https://images.unsplash.com/photo-1637053596634-66db164b9ea2',
    alt: 'Cell tower and telecommunications antenna against a blue sky',
  },
  {
    name: 'Transportation',
    image: 'https://images.unsplash.com/photo-1702470193332-8919fa3b4105',
    alt: 'Busy highway interchange with multiple lanes of traffic at night',
  },
  {
    name: 'Information Technology & Agentic AI',
    image: '/assets/industries/agentic-ai.png',
    alt: 'Abstract network of enterprise IT systems and autonomous AI agents connected by encrypted data pathways',
  },
  {
    name: 'IoT',
    image: '/assets/industries/iot.png',
    alt: 'Industrial IoT sensors, gateways, and connected field devices monitoring a refinery at dusk',
  },
];

const heroVideos = [
  '/assets/hero-video.mp4',
  '/assets/hero-video-2.mp4',
  '/assets/industries-hero-clip-1.mp4',
  '/assets/industries-hero-clip-2.mp4',
];

const HERO_FADE = 0.9; // seconds of crossfade overlap

export default function IndustriesPage() {
  const [heroIndex, setHeroIndex] = useState(0);
  const [mountedVideos, setMountedVideos] = useState<Set<number>>(new Set());
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const activeRef = useRef(0);
  const transitioning = useRef(false);

  const goTo = useCallback((next: number) => {
    const v = videoRefs.current[next];
    if (v) {
      try {
        v.currentTime = 0;
        const p = v.play();
        if (p) p.catch(() => {});
      } catch {
        /* ignore */
      }
    }
    activeRef.current = next;
    setHeroIndex(next);
  }, []);

  const advance = useCallback(
    (from: number) => {
      if (from !== activeRef.current) return;
      if (transitioning.current) return;
      transitioning.current = true;
      const next = (from + 1) % heroVideos.length;
      setMountedVideos((prev) => {
        if (prev.has(next)) return prev;
        return new Set([...prev, next]);
      });
      window.setTimeout(() => {
        goTo(next);
        window.setTimeout(() => {
          transitioning.current = false;
        }, HERO_FADE * 1000);
      }, 60);
    },
    [goTo]
  );

  const handleTimeUpdate = useCallback(
    (i: number) => {
      if (i !== activeRef.current) return;
      const v = videoRefs.current[i];
      if (!v || !v.duration || !isFinite(v.duration)) return;
      if (v.duration > HERO_FADE && v.currentTime >= v.duration - HERO_FADE) {
        advance(i);
      }
    },
    [advance]
  );

  useEffect(() => {
    setMountedVideos(new Set([0]));
  }, []);

  useEffect(() => {
    if (mountedVideos.has(0) && mountedVideos.size === 1) {
      const v = videoRefs.current[0];
      if (v) {
        const p = v.play();
        if (p) p.catch(() => {});
      }
    }
  }, [mountedVideos]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Hero Section (video) */}
      <section className="relative w-screen left-1/2 -translate-x-1/2 h-[70vh] min-h-[480px] max-h-[720px] overflow-hidden bg-black">
        {/* Static poster shown before any video mounts */}
        <img
          src="/assets/hero-poster.jpg"
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity ease-in-out ${mountedVideos.size === 0 ? 'opacity-100' : 'opacity-0'}`}
          style={{ transitionDuration: `${HERO_FADE * 1000}ms` }}
        />
        {heroVideos.map((src, i) =>
          mountedVideos.has(i) ? (
            <video
              key={src}
              ref={(el) => {
                videoRefs.current[i] = el;
              }}
              src={src}
              poster="/assets/hero-poster.jpg"
              muted
              playsInline
              preload="none"
              onTimeUpdate={() => handleTimeUpdate(i)}
              onEnded={() => advance(i)}
              className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity ease-in-out ${
                i === heroIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ transitionDuration: `${HERO_FADE * 1000}ms` }}
            />
          ) : null
        )}
        {/* Centered hero heading over the video */}
        <div className="absolute inset-0 z-10 flex items-center justify-center px-4">
          <h2 className="text-balance text-center font-bold text-white leading-tight capitalize text-2xl sm:text-3xl md:text-4xl lg:text-5xl [text-shadow:0_2px_14px_rgba(0,0,0,0.55)]">
            Leveraging The Zero Transit Paradigm
          </h2>
        </div>
      </section>

      {/* Page Content */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <div className="mb-10">
          <h1 className="text-[1.9rem] sm:text-[2.55rem] leading-tight font-bold text-gray-900 tracking-tight">
            Industry Use Cases
          </h1>
          <p className="mt-2 text-gray-500 text-lg">
            Explore the sectors we serve with tailored solutions and deep expertise.
          </p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((industry) => {
            const slug = industry.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '');
            return (
              <Link
                key={industry.name}
                href={`/industries/${slug}`}
                className="relative overflow-hidden rounded-xl cursor-pointer group aspect-[4/3] block"
              >
                {/* Image */}
                <Image
                  src={industry.image}
                  alt={industry.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />

                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Industry name label */}
                <div className="absolute bottom-0 left-0 p-4">
                  <span className="text-white text-lg font-semibold leading-tight drop-shadow-md">
                    {industry.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
