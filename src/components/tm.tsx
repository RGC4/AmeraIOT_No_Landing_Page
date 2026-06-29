import React from 'react';

const REG_CLASS = 'text-[0.86em] font-normal text-[#4D9FD6]';

export function Reg() {
  return <sup className={REG_CLASS}>®</sup>;
}

// Matches the Amera brand marks (AmeraKey, AmeraSecrets, and standalone Amera),
// optionally already followed by a literal ®/™, OR a standalone ®/™ symbol.
// Excludes the corporate name "Amera IoT" / "AmeraIoT" and the "AmeraQ" sub-name.
const BRAND_RE = /(AmeraKey|AmeraSecrets|Amera(?![A-Za-z])(?!\s?IoT))([®™]?)|([®™])/g;

export function tm(text: string): React.ReactNode {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  BRAND_RE.lastIndex = 0;
  while ((match = BRAND_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[1]) {
      // Brand name — always render a single ® superscript, consuming any
      // pre-existing literal mark so it is never doubled.
      const symbol = match[2] === '™' ? '™' : '®';
      nodes.push(match[1]);
      nodes.push(
        <sup key={key++} className={REG_CLASS}>
          {symbol}
        </sup>,
      );
    } else if (match[3]) {
      // Standalone ®/™ symbol.
      nodes.push(
        <sup key={key++} className={REG_CLASS}>
          {match[3]}
        </sup>,
      );
    }

    lastIndex = BRAND_RE.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}
