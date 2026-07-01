'use client';

import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import { Reg, tm } from '@/components/tm';

const problemSolutions: string[] = [
  'AmeraKey® provides quantum proof symmetric keys of key lengths up to 4096 bits.',
  'Our keys are never stored or exposed.',
  'AmeraKey® solves the problem of synchronizing keys at multiple remote locations.',
  'AmeraKey® provides a large near instantaneous entropy pool which allows the changing of keys on the fly.',
  'AmeraKey® eliminates passwords as a method for key generation thus minimizing the efficacy of phishing attacks.',
  'Amera® technology facilitates the implementation of a Zero Trust environment.',
  'AmeraKey® is a user friendly and frictionless solution for securing both data at rest and data in motion.',
];

export default function CompanyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Hero band */}
      <section className="relative overflow-hidden">
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
          <p className="text-white/70 text-sm font-semibold tracking-[2px] uppercase">About Us</p>
          <h1 className="mt-3 text-[1.9rem] sm:text-[2.55rem] font-bold text-white tracking-tight">
            Company
          </h1>
          <p className="mt-4 text-white/85 text-base sm:text-lg leading-relaxed">
            AMERA IoT Inc. — frictionless, quantum-proof security that keeps you in control of your
            data.
          </p>
        </div>
      </section>

      {/* Vision & Mission */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-on-gray p-8">
            <h2 className="text-2xl font-bold text-gray-900">Our Vision</h2>
            <div className="mt-3 h-1 w-12 rounded-full bg-primary" />
            <p className="mt-5 text-gray-600 leading-relaxed">
              To provide a user friendly, frictionless, and highly secure quantum proof technology
              that enables users to maintain control of their data.
            </p>
            <p className="mt-4 text-gray-600 leading-relaxed">
              We accomplish this through our patented technologies, which are used to generate and
              distribute symmetric encryption keys and codes between remote users and applications
              without either storing or transmitting the key itself.
            </p>
          </div>

          <div className="card-on-gray p-8">
            <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
            <div className="mt-3 h-1 w-12 rounded-full bg-primary" />
            <p className="mt-5 text-gray-600 leading-relaxed">
              To develop and market our technology to Businesses, Consumers and Developers who seek
              to combat the growing cybersecurity threats of malware, phishing, and ransomware. Our
              products will include applications for devices, licenses and revenue shares for
              hardware and software developers and chip manufacturers and a suite of Software as a
              Service solutions in the cloud.
            </p>
            <p className="mt-4 text-gray-600 leading-relaxed">
              Founded by veterans in the IT, Software, and Semi-conductor industries, AmeraIoT is
              uniquely positioned to provide solutions for both data at rest and data in motion in a
              variety of markets such as financial services, computing, communications, energy,
              government, aerospace, automotive, industrial and consumer IoT, consumer electronics
              or anywhere that data and devices need to be secured.
            </p>
          </div>
        </div>

        {/* Problems and Solutions */}
        <section className="mt-8">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-primary text-sm font-semibold tracking-[2px] uppercase">
              AMERA IoT Inc.
            </p>
            <h2 className="mt-2 text-[1.9rem] sm:text-[2.55rem] leading-tight font-bold text-gray-900 tracking-tight">
              Problems and Solutions
            </h2>
            <p className="mt-5 text-gray-600 leading-relaxed">
              Today&rsquo;s encryption solutions suffer from several problems. Among those problems
              is the fact that public key encryption is not quantum proof, and today&rsquo;s
              implementation of symmetric key encryption relies on either transmitting the key
              itself or deriving the key from a user password, neither of which is an optimal
              solution for key distribution. In addition, many of the implementations are neither
              user friendly nor well suited for remote applications. Amera
              <Reg /> addresses these issues with its AmeraKey
              <Reg /> technology.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {problemSolutions.map((item, idx) => (
              <div key={idx} className="card-on-gray p-6 flex gap-4">
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
          <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-dark px-8 py-12 text-center">
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
