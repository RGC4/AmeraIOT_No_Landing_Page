import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Vision & Mission — Amera Technologies',
  description:
    "Amera's vision and mission: eliminating PKI complexity and delivering deterministic machine identity at scale.",
  path: '/company/vision-and-mission',
});

export default function VisionMissionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
