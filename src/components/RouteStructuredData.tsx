import { headers } from 'next/headers';
import JsonLd from '@/components/JsonLd';
import { getRouteStructuredData } from '@/lib/structured-data';

/**
 * Server component that renders the route-specific JSON-LD for the current
 * request. It reads the request path and the per-request CSP nonce from the
 * headers set by src/middleware.ts, so structured data is allowed under the
 * strict, nonce-based `script-src` (no `'unsafe-inline'`).
 */
export default async function RouteStructuredData() {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') ?? '';
  const nonce = headerList.get('x-nonce') ?? undefined;

  const data = getRouteStructuredData(pathname);
  if (!data) return null;

  return <JsonLd data={data} nonce={nonce} />;
}
