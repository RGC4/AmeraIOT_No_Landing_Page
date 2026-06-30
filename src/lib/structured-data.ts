import { advisors } from '@/app/company/board-of-advisors/advisors';
import { executives } from '@/app/company/executive-team/executives';
import { industryMeta } from '@/app/industries/[slug]/industry-meta';

/**
 * Route-level JSON-LD structured data.
 *
 * These schemas were previously embedded as inline <script> blocks inside
 * `'use client'` page components. They now live here so they can be rendered by
 * a server component (see src/components/RouteStructuredData.tsx) that attaches
 * the per-request CSP nonce — allowing us to drop `'unsafe-inline'` from
 * `script-src`. The home/contact/legal pages intentionally have no extra
 * schema; the site-wide Organization/WebSite graph lives in the root layout.
 */

const companySchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'Company — Amera Technologies',
  description: 'AMERA IoT Inc. — frictionless, quantum-proof security that keeps you in control of your data.',
  url: 'https://ameraiot.com/company',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ameraiot.com' },
      { '@type': 'ListItem', position: 2, name: 'Company', item: 'https://ameraiot.com/company' },
    ],
  },
  publisher: {
    '@type': 'Organization',
    '@id': 'https://ameraiot.com/#organization',
    name: 'Amera Technologies',
  },
};

const advisorsSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Amera Technologies Board of Advisors',
  url: 'https://ameraiot.com/company/board-of-advisors',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ameraiot.com' },
      { '@type': 'ListItem', position: 2, name: 'Company', item: 'https://ameraiot.com/company' },
      { '@type': 'ListItem', position: 3, name: 'Board of Advisors', item: 'https://ameraiot.com/company/board-of-advisors' },
    ],
  },
  itemListElement: advisors.map((advisor, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    item: {
      '@type': 'Person',
      name: advisor.name,
      jobTitle: advisor.title,
      worksFor: {
        '@type': 'Organization',
        '@id': 'https://ameraiot.com/#organization',
        name: 'Amera Technologies',
      },
    },
  })),
};

const execSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Amera Technologies Executive Team',
  url: 'https://ameraiot.com/company/executive-team',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ameraiot.com' },
      { '@type': 'ListItem', position: 2, name: 'Company', item: 'https://ameraiot.com/company' },
      { '@type': 'ListItem', position: 3, name: 'Executive Team', item: 'https://ameraiot.com/company/executive-team' },
    ],
  },
  itemListElement: executives.map((exec, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    item: {
      '@type': 'Person',
      name: exec.name,
      jobTitle: exec.title,
      worksFor: {
        '@type': 'Organization',
        '@id': 'https://ameraiot.com/#organization',
        name: 'Amera Technologies',
      },
    },
  })),
};

const resourcesSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Amera White Papers',
  description: 'White papers covering post-quantum encryption, AmeraKey technology, PKI alternatives, and IoT security.',
  url: 'https://ameraiot.com/resources',
  publisher: {
    '@type': 'Organization',
    '@id': 'https://ameraiot.com/#organization',
    name: 'Amera Technologies',
  },
  hasPart: [
    { '@type': 'DigitalDocument', name: 'AmeraKey Quantum-Proof Encryption', url: 'https://ameraiot.com/assets/whitepaper-quantum-proof.pdf' },
    { '@type': 'DigitalDocument', name: 'Why PKI Is the Wrong Bet for the Post-Quantum Era', url: 'https://ameraiot.com/assets/whitepaper-pki-wrong-bet.pdf' },
    { '@type': 'DigitalDocument', name: 'AmeraKey Introducing True IoT Security', url: 'https://ameraiot.com/assets/whitepaper-iot-security.pdf' },
    { '@type': 'DigitalDocument', name: 'AmeraKey Controlled Quantum Key Distribution', url: 'https://ameraiot.com/assets/whitepaper-controlled-qkd.pdf' },
  ],
};

const amerasecretsSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'AmeraSecrets',
  description:
    'AmeraSecrets combines deterministic key generation, automated secret lifecycle management, and enterprise policy controls into a unified platform for modern applications, cloud services, and connected infrastructure.',
  url: 'https://ameraiot.com/products/amerasecrets',
  brand: {
    '@type': 'Organization',
    '@id': 'https://ameraiot.com/#organization',
    name: 'Amera Technologies',
  },
  category: 'Enterprise Secrets Management Software',
};

const amerakeySchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'AmeraKey',
  description:
    'AmeraKey harvests high-entropy key material from an image, PIN, session value, and selected harvest mode so trusted endpoints can regenerate matching symmetric keys locally — without transmitting key material across the network.',
  url: 'https://ameraiot.com/products/amerakey',
  brand: {
    '@type': 'Organization',
    '@id': 'https://ameraiot.com/#organization',
    name: 'Amera Technologies',
  },
  category: 'Cryptography Software',
};

const industriesSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Industry Use Cases — Amera Technologies',
  description: 'Explore how Amera post-quantum encryption and key governance serves manufacturing, oil & gas, utilities, financial services, government, maritime, healthcare, and more.',
  url: 'https://ameraiot.com/industries',
  publisher: {
    '@type': 'Organization',
    '@id': 'https://ameraiot.com/#organization',
    name: 'Amera Technologies',
  },
};

function industryBreadcrumb(slug: string) {
  const meta = industryMeta[slug];
  if (!meta) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ameraiot.com' },
      { '@type': 'ListItem', position: 2, name: 'Industries', item: 'https://ameraiot.com/industries' },
      { '@type': 'ListItem', position: 3, name: meta.name, item: `https://ameraiot.com/industries/${slug}` },
    ],
  };
}

const STATIC_SCHEMAS: Record<string, unknown> = {
  '/company': companySchema,
  '/company/board-of-advisors': advisorsSchema,
  '/company/executive-team': execSchema,
  '/resources': resourcesSchema,
  '/products/amerasecrets': amerasecretsSchema,
  '/products/amerakey': amerakeySchema,
  '/industries': industriesSchema,
};

/**
 * Resolve the JSON-LD payload for a given pathname, or `null` when the route
 * has no route-specific structured data. The `/news` feed builds its own
 * (article-derived) schema inside its server page.
 */
export function getRouteStructuredData(pathname: string): unknown {
  const path = pathname !== '/' && pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname;

  if (path in STATIC_SCHEMAS) return STATIC_SCHEMAS[path];

  const industryMatch = path.match(/^\/industries\/([^/]+)$/);
  if (industryMatch) return industryBreadcrumb(industryMatch[1]);

  return null;
}
