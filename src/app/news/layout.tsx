import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'News — Amera®',
  description:
    'Latest cybersecurity news and insights relevant to machine identity, key management, and critical infrastructure protection.',
  path: '/news',
});

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
