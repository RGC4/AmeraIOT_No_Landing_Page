'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { Reg } from '@/components/tm';

const sections = [
  {
    heading: 'Acceptance of Terms',
    body: 'By accessing or using the Amera website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not access or use our website or services.',
  },
  {
    heading: 'Use of Our Website',
    body: 'You may use our website for lawful purposes only. You agree not to use the site in any way that could damage, disable, or impair it, interfere with another party\u2019s use, or attempt to gain unauthorized access to any systems or networks connected to it.',
  },
  {
    heading: 'Intellectual Property',
    body: 'All content on this website \u2014 including text, graphics, logos, product names, software, and design \u2014 is the property of Amera or its licensors and is protected by applicable intellectual property laws. You may not reproduce, distribute, modify, or create derivative works without our prior written consent.',
  },
  {
    heading: 'Product and Service Information',
    body: 'Information about our products and services is provided for general informational purposes and may change without notice. Nothing on this website constitutes a binding offer, warranty, or commitment unless set out in a separate written agreement signed by Amera.',
  },
  {
    heading: 'Third-Party Links',
    body: 'Our website may contain links to third-party websites or resources. We provide these links for convenience only and are not responsible for the content, products, or practices of any third-party sites.',
  },
  {
    heading: 'Disclaimer of Warranties',
    body: 'Our website and its content are provided "as is" and "as available" without warranties of any kind, whether express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, and non-infringement.',
  },
  {
    heading: 'Limitation of Liability',
    body: 'To the fullest extent permitted by law, Amera shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of, or inability to use, our website or services.',
  },
  {
    heading: 'Indemnification',
    body: 'You agree to indemnify and hold harmless Amera and its officers, employees, and agents from any claims, liabilities, damages, and expenses arising out of your use of the website or your violation of these terms.',
  },
  {
    heading: 'Governing Law',
    body: 'These Terms of Service are governed by and construed in accordance with applicable law, without regard to conflict-of-law principles. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the competent courts.',
  },
  {
    heading: 'Changes to These Terms',
    body: 'We may revise these Terms of Service from time to time. The most current version will always be posted on this page with an updated "Last updated" date. Your continued use of the website after changes take effect constitutes acceptance of the revised terms.',
  },
  {
    heading: 'Contact Us',
    body: 'If you have questions about these Terms of Service, please reach out through our Contact page.',
  },
];

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Hero band */}
      <section className="relative overflow-hidden bg-primary-dark">
        <Image
          src="/assets/legal-header-bg-v2.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <p className="text-white/70 text-sm font-semibold tracking-[2px] uppercase">Legal</p>
          <h1 className="mt-3 text-[1.9rem] sm:text-[2.55rem] font-bold text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-4 text-white/85 text-base sm:text-lg leading-relaxed">
            The terms governing your use of the Amera
            <Reg /> website and services.
          </p>
        </div>
      </section>

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <p className="text-sm text-gray-500 mb-10">Last updated: June 21, 2026</p>
        <div className="space-y-10">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{s.heading}</h2>
              <div className="mt-3 h-1 w-12 rounded-full bg-primary" />
              <p className="mt-4 text-gray-700 text-base leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
