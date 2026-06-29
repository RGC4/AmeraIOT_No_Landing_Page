'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';

type Item = { term?: string; desc: string };
type Group = { label: string; items: Item[] };

type Section = {
  heading: string;
  intro?: string;
  groups?: Group[];
  bullets?: Item[];
  paragraphs?: string[];
  closing?: string;
};

const sections: Section[] = [
  {
    heading: '1. Information We Collect',
    intro:
      'We collect information that identifies, relates to, or could reasonably be linked with you. This includes:',
    groups: [
      {
        label: 'Information You Provide Directly:',
        items: [
          { term: 'Contact Data', desc: 'Name, email address, postal address, phone number.' },
          { term: 'Account Credentials', desc: 'Usernames, passwords, and security questions.' },
          {
            term: 'Payment Information',
            desc: 'Credit card details, billing address, and transaction history. If you use a third-party processor like Stripe or PayPal, they handle this information directly.',
          },
          { term: 'User Content', desc: 'Comments, reviews, or messages sent through contact forms.' },
        ],
      },
      {
        label: 'Information Collected Automatically:',
        items: [
          {
            term: 'Device and Log Data',
            desc: 'IP address, browser type, operating system, referring URLs, pages viewed, and the dates/times of your visits.',
          },
          {
            term: 'Cookies and Tracking Technologies',
            desc: 'We use cookies, web beacons, and pixels to track activity on our Site and store certain information to improve your experience.',
          },
        ],
      },
    ],
  },
  {
    heading: '2. How We Use Your Information',
    intro: 'We use the collected data for various purposes, including to:',
    bullets: [
      { desc: 'Provide, operate, and maintain our Site and services.' },
      { desc: 'Process transactions, manage orders, and send related invoices.' },
      { desc: "Improve, personalize, and expand our website's features and performance." },
      {
        desc: 'Communicate with you, either directly or through a partner, for customer service, updates, or marketing.',
      },
      { desc: 'Detect, prevent, and address technical issues, fraud, or illegal activity.' },
    ],
  },
  {
    heading: '3. Sharing Your Information',
    intro:
      'We do not sell your personal information. We may share your data with third parties only in the following circumstances:',
    bullets: [
      {
        term: 'Service Providers',
        desc: 'We share data with trusted vendors who perform services for us (e.g., web hosting, payment processing, email delivery, or data analysis).',
      },
      {
        term: 'Legal Compliance',
        desc: 'We may disclose your information if required to do so by law, subpoena, or to protect the rights, property, and safety of our users or the public.',
      },
      {
        term: 'Business Transfers',
        desc: 'If we are involved in a merger, acquisition, or asset sale, your personal information may be transferred as a business asset.',
      },
    ],
  },
  {
    heading: '4. Your Rights and Choices',
    intro:
      'Depending on where you live (such as the EU/UK under GDPR or California under the CCPA), you may have the following rights regarding your personal data:',
    bullets: [
      { term: 'Access/Portability', desc: 'The right to request copies of your personal data.' },
      {
        term: 'Correction',
        desc: 'The right to request that we correct inaccurate or incomplete information.',
      },
      {
        term: 'Deletion',
        desc: 'The right to request that we erase your personal data under certain conditions.',
      },
      {
        term: 'Opt-Out',
        desc: 'The right to opt-out of marketing communications or object to certain processing activities.',
      },
      {
        term: 'Cookies',
        desc: 'You can set your browser to refuse all or some cookies, or to alert you when cookies are being sent.',
      },
    ],
    closing: 'To exercise any of these rights, please contact us using the details below.',
  },
  {
    heading: '5. Security of Data',
    paragraphs: [
      'The security of your data is important to us, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.',
    ],
  },
  {
    heading: "6. Children's Privacy",
    paragraphs: [
      'Our Site is not directed to children. We do not knowingly collect personally identifiable information from children. If you become aware that a child has provided us with personal data, please contact us immediately so we can remove it.',
    ],
  },
  {
    heading: '7. Changes to This Privacy Policy',
    paragraphs: [
      'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top. You are advised to review this Privacy Policy periodically for any changes.',
    ],
  },
  {
    heading: '8. Contact Us',
    intro: 'If you have any questions or concerns about this Privacy Policy, please contact us:',
    bullets: [
      { term: 'By Email', desc: '[Your Contact Email Address]' },
      { term: 'By Mail', desc: 'Amera IoT, Inc., Belt Line Road, Suite 212-288, Addison, TX 75001' },
      { term: 'By Phone', desc: '[Your Business Phone Number]' },
    ],
  },
];

function ItemLine({ item }: { item: Item }) {
  return (
    <li className="text-gray-700 text-base leading-relaxed">
      {item.term ? (
        <>
          <span className="font-semibold text-gray-900">{item.term}:</span> {item.desc}
        </>
      ) : (
        item.desc
      )}
    </li>
  );
}

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          <p className="mt-4 text-white/85 text-base sm:text-lg leading-relaxed">
            How Amera IoT, Inc. collects, uses, and shares your personal information when you visit
            or make a purchase from ameraiot.com.
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="card-on-gray p-8 sm:p-12">
          <div className="flex justify-center">
            <Image
              src="/assets/amera-logo-full.png"
              alt="Amera"
              width={280}
              height={103}
              className="h-auto w-[220px] sm:w-[260px]"
              priority
            />
          </div>

          <p className="mt-8 text-sm text-gray-500">Last Updated: June 21, 2026</p>

          <p className="mt-4 text-gray-700 text-base leading-relaxed">
            This Privacy Policy describes how Amera IoT, Inc. (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
            &ldquo;our&rdquo;) collects, uses, and shares your personal information when you visit or
            make a purchase from ameraiot.com (the &ldquo;Site&rdquo;).
          </p>

          <div className="mt-10 space-y-10">
            {sections.map((s) => (
              <section key={s.heading}>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{s.heading}</h2>
                <div className="mt-3 h-1 w-12 rounded-full bg-primary" />

                {s.intro && (
                  <p className="mt-4 text-gray-700 text-base leading-relaxed">{s.intro}</p>
                )}

                {s.paragraphs?.map((p, i) => (
                  <p key={i} className="mt-4 text-gray-700 text-base leading-relaxed">
                    {p}
                  </p>
                ))}

                {s.groups?.map((g) => (
                  <div key={g.label} className="mt-4">
                    <p className="font-semibold text-gray-900">{g.label}</p>
                    <ul className="mt-2 ml-5 list-disc space-y-2 marker:text-primary">
                      {g.items.map((item, i) => (
                        <ItemLine key={i} item={item} />
                      ))}
                    </ul>
                  </div>
                ))}

                {s.bullets && (
                  <ul className="mt-4 ml-5 list-disc space-y-2 marker:text-primary">
                    {s.bullets.map((item, i) => (
                      <ItemLine key={i} item={item} />
                    ))}
                  </ul>
                )}

                {s.closing && (
                  <p className="mt-4 text-gray-700 text-base leading-relaxed">{s.closing}</p>
                )}
              </section>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
