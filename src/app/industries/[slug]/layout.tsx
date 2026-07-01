import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { industryMeta } from './industry-meta';

const slugLabels: Record<string, string> = {
  manufacturing: 'Manufacturing',
  'oil-gas': 'Oil & Gas',
  utilities: 'Utilities',
  'financial-services': 'Financial Services',
  'government-and-defense': 'Government & Defense',
  maritime: 'Maritime',
  'life-sciences-and-healthcare': 'Life Sciences & Healthcare',
  retail: 'Retail',
  telecommunications: 'Telecommunications',
  transportation: 'Transportation',
  'information-technology-agentic-ai': 'Information Technology & Agentic AI',
  iot: 'IoT',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const label = slugLabels[slug] ?? slug;
  const meta = industryMeta[slug];
  return pageMetadata({
    title: `${label} — Amera Technologies`,
    description: `Amera delivers certificate-free machine identity and automated key governance for the ${label} sector.`,
    path: `/industries/${slug}`,
    image: meta?.image,
    imageAlt: meta?.alt,
  });
}

export default function IndustrySlugLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
