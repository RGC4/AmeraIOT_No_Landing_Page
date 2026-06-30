import React from 'react';

// No color here on purpose: the mark inherits `currentColor` so the ®/™ always
// matches the color of the word it sits on. Size/weight only.
const REG_CLASS = 'text-[0.86em] font-normal';

export function Reg() {
  return <sup className={REG_CLASS}>®</sup>;
}

// Matches the Amera brand marks (AmeraKey, AmeraSecrets, and standalone Amera),
// optionally already followed by a literal ®/™, OR a standalone ®/™ symbol.
// Excludes the corporate name "Amera IoT" / "AmeraIoT" and the "AmeraQ" sub-name.
const BRAND_RE = /(AmeraKey|AmeraSecrets|Amera(?![A-Za-z])(?!\s?IoT))([®™]?)|([®™])/g;

export function tm(text: string, opts?: { markClassName?: string }): React.ReactNode {
  const markClass = opts?.markClassName ?? REG_CLASS;
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
        <sup key={key++} className={markClass}>
          {symbol}
        </sup>,
      );
    } else if (match[3]) {
      // Standalone ®/™ symbol.
      nodes.push(
        <sup key={key++} className={markClass}>
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
