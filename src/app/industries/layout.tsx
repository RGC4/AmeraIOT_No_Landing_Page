import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Industries — Amera®',
  description:
    'Amera secures critical infrastructure across manufacturing, energy, financial services, government, healthcare, and more.',
  path: '/industries',
});

export default function IndustriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
