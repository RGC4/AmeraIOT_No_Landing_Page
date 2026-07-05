import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Patents — Amera®',
  description:
    'The Amera® patent portfolio covering deterministic key derivation, certificate-free identity, and cryptographic key governance innovations.',
  path: '/company/patents',
});

export default function PatentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
