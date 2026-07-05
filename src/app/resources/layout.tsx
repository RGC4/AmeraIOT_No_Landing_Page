import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Resources — Amera®',
  description:
    'Technical resources, white papers, and documentation on certificate-free identity and deterministic key governance from Amera®.',
  path: '/resources',
});

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
