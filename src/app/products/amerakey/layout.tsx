import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'AmeraKey — Certificate-Free Machine Identity & Key Governance',
  description:
    'AmeraKey delivers deterministic, hardware-rooted machine identity and automated key lifecycle management — eliminating PKI complexity across OT, IT, and classified networks.',
  path: '/products/amerakey',
  image: '/assets/og-amerakey.jpg',
  imageAlt: 'AmeraKey architecture diagram',
  imageWidth: 1200,
  imageHeight: 630,
});

export default function AmeraKeyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
