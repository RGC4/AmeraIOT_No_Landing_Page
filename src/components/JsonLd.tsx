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
 * Renders a JSON-LD <script> block. `type="application/ld+json"` is inert data,
 * not executable script, and the production CSP allows inline scripts, so no
 * nonce is needed.
 */
export default function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialize(data) }}
    />
  );
}
