import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Executive Team — Amera Technologies',
  description:
    'Meet the executive team leading Amera Technologies in redefining machine identity and key governance.',
  path: '/company/executive-team',
});

export default function ExecutiveTeamLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
