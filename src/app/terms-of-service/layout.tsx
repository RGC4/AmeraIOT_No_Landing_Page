import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Terms of Service — Amera Technologies',
  description:
    'Terms of service for Amera Technologies — the conditions governing use of our website and services.',
  path: '/terms-of-service',
});

export default function TermsOfServiceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
