import React from 'react';

/**
 * Serialize a JSON-LD payload for safe embedding inside a <script> tag.
 * Escapes the characters that could otherwise break out of the script
 * element or be misinterpreted by the HTML parser.
 */
function serialize(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

/**
 * Server-renderable JSON-LD <script> block. The `nonce` is sourced from the
 * per-request CSP nonce (see src/middleware.ts) so the structured data is
 * allowed under a strict `script-src 'self' 'nonce-...' 'strict-dynamic'`
 * policy with no `'unsafe-inline'`.
 *
 * `suppressHydrationWarning` is required here: for security, browsers blank out
 * the `nonce` attribute in the DOM once the page has loaded. On hydration React
 * reads that emptied attribute, compares it to the nonce it still holds, and
 * (correctly seeing a difference) logs a hydration mismatch. The script is fine
 * — the nonce was applied at parse time — so we tell React not to warn on this
 * element's attributes rather than dropping the nonce.
 */
export default function JsonLd({ data, nonce }: { data: unknown; nonce?: string }) {
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: serialize(data) }}
    />
  );
}
