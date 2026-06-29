import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'AmeraSecrets — Secrets Management Without a Vault',
  description:
    'AmeraSecrets eliminates centralized secret stores by deriving secrets deterministically at runtime — no vault, no replication, no single point of failure.',
  path: '/products/amerasecrets',
  image: '/assets/og-amerasecrets.jpg',
  imageAlt: 'AmeraSecrets architecture diagram',
  imageWidth: 1200,
  imageHeight: 630,
});

export default function AmeraSecretsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
