'use client';

import { usePathname } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import { getRouteStructuredData } from '@/lib/structured-data';

/**
 * Renders the route-specific JSON-LD for the current path. It reads the path
 * with usePathname() rather than the request headers, so the page stays
 * statically prerenderable and CDN-cacheable. usePathname() is available during
 * static prerendering, so the structured data is still baked into the HTML.
 */
export default function RouteStructuredData() {
  const pathname = usePathname();
  const data = getRouteStructuredData(pathname);
  if (!data) return null;

  return <JsonLd data={data} />;
}
