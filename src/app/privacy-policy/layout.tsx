import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Policy — Amera®',
  description:
    'Privacy policy for Amera® — how we collect, use, and protect your information.',
  path: '/privacy-policy',
});

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
