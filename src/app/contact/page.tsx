'use client';

import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import { Reg } from '@/components/tm';

export default function ContactPage() {
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
          <p className="text-sm font-semibold uppercase tracking-wider text-white/70">Get in Touch</p>
          <h1 className="mt-2 text-[1.9rem] sm:text-[2.55rem] leading-tight font-bold tracking-tight">Contact Us</h1>
          <p className="mt-4 text-white/90 text-lg leading-relaxed">
            Have a question about Amera<Reg />&rsquo;s quantum-proof, transmission-free encryption? Send us a
            message and our team will get back to you.
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact form */}
          <form className="lg:col-span-2 card-on-gray p-6 sm:p-8 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-1.5">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full rounded-lg border border-[#114D8F] px-4 py-2.5 text-sm text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-1.5">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-lg border border-[#114D8F] px-4 py-2.5 text-sm text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="company" className="block text-sm font-semibold text-gray-900 mb-1.5">Company</label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  className="w-full rounded-lg border border-[#114D8F] px-4 py-2.5 text-sm text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-1.5">Phone Number <span className="font-normal text-gray-400">(optional)</span></label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="w-full rounded-lg border border-[#114D8F] px-4 py-2.5 text-sm text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" />
              </div>
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-1.5">Message</label>
              <textarea
                id="message"
                name="message"
                rows={6}
                required
                className="w-full rounded-lg border border-[#114D8F] px-4 py-2.5 text-sm text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition resize-y" />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-[#114D8F] hover:bg-[#0d3d72] text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors shadow-sm">
              Send Message
            </button>
          </form>

          {/* Contact details */}
          <aside className="space-y-6">
            <div className="card-on-gray p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Reach Us Directly</h2>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-full bg-primary/10 text-primary">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <div>
                    <div className="font-semibold text-gray-900">Email</div>
                    <a href="mailto:info@ameramail.com" className="text-primary hover:text-primary-dark transition-colors">info@ameramail.com</a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-full bg-primary/10 text-primary">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  <div>
                    <div className="font-semibold text-gray-900">Company</div>
                    <span className="text-gray-600">Amera IoT, Inc.</span>
                  </div>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
