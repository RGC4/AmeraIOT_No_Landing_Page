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
 */
export default function JsonLd({
  data,
  nonce,
}: {
  data: unknown;
  nonce?: string;
}) {
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: serialize(data) }}
    />
  );
}
