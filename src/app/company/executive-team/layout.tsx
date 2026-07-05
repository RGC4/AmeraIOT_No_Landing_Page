import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Executive Team — Amera®',
  description:
    'Meet the executive team leading Amera® in redefining machine identity and key governance.',
  path: '/company/executive-team',
});

export default function ExecutiveTeamLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
