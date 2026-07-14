import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import JsonLd from '@/components/JsonLd';
import RouteStructuredData from '@/components/RouteStructuredData';
import { pageMetadata, SITE_URL } from '@/lib/seo';
import '../styles/index.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...pageMetadata({
    title: 'Amera® — Certificate-Free Identity & Key Governance',
    description:
      'Amera delivers deterministic, hardware-rooted machine identity and automated key governance — eliminating PKI complexity across OT, IT, and classified networks.',
    path: '',
  }),
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/icon.png' }],
  },
};

const siteSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://ameraiot.com/#organization',
      name: 'Amera®',
      alternateName: 'AMERA IoT Inc.',
      url: 'https://ameraiot.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://ameraiot.com/assets/amera-logo-full.png',
      },
      description:
        'Amera delivers deterministic, hardware-rooted machine identity and automated key governance — eliminating PKI complexity across OT, IT, and classified networks.',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://ameraiot.com/#website',
      url: 'https://ameraiot.com',
      name: 'Amera®',
      publisher: { '@id': 'https://ameraiot.com/#organization' },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <JsonLd data={siteSchema} />
        <RouteStructuredData />
        {children}
      </body>
    </html>
  );
}
