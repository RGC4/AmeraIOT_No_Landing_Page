import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Patents — Amera Technologies',
  description:
    "Amera Technologies' patent portfolio covering deterministic key derivation, certificate-free identity, and cryptographic key governance innovations.",
  path: '/company/patents',
});

export default function PatentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
