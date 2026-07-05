import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Board of Advisors — Amera®',
  description:
    'Meet the board of advisors guiding Amera® in security, identity, and critical infrastructure.',
  path: '/company/board-of-advisors',
});

export default function BoardOfAdvisorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
