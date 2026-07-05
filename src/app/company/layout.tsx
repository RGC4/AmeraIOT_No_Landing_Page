import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Company — Amera®',
  description:
    'Learn about Amera® — the team, vision, mission, and advisors behind certificate-free machine identity.',
  path: '/company',
});

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
